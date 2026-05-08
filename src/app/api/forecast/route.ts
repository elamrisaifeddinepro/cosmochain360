import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Forecast from '@/models/Forecast'
import Order from '@/models/Order'
import Product from '@/models/Product'
import { calculateROP, calculateSafetyStock } from '@/lib/utils'
import { getISOWeek, getYear, addWeeks } from 'date-fns'
import { requireManagerOrAdmin } from '@/lib/auth-guards'
import { getRequestInfo, logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

function movingAverage(data: number[], window = 12): number {
  if (data.length === 0) return 0

  const slice = data.slice(-window)

  return slice.reduce((a, b) => a + b, 0) / slice.length
}

function stdDev(data: number[]): number {
  if (data.length < 2) return 0

  const mean = data.reduce((a, b) => a + b, 0) / data.length

  const variance =
    data.reduce((sum, val) => sum + (val - mean) ** 2, 0) / (data.length - 1)

  return Math.sqrt(variance)
}

export async function GET(req: NextRequest) {
  const auth = await requireManagerOrAdmin()

  if (!auth.authorized) {
    return auth.response
  }

  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get('productId')
    const site = searchParams.get('site') || 'MTL-01'
    const weeks = Number(searchParams.get('weeks') || 12)

    const query: any = { site }

    if (productId) {
      query.productId = productId
    }

    const forecasts = await Forecast.find(query)
      .sort({ week: -1 })
      .limit(weeks)
      .populate(
        'productId',
        'nameFr nameEn sku reorderPoint safetyStock leadTimeDays'
      )
      .lean()

    return NextResponse.json(forecasts.reverse())
  } catch (error) {
    console.error('GET /api/forecast error:', error)

    return NextResponse.json(
      { error: 'Erreur serveur lors du chargement des prévisions' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireManagerOrAdmin()

  if (!auth.authorized) {
    return auth.response
  }

  try {
    await dbConnect()

    const body = await req.json()
    const { productId, site = 'MTL-01', weeksAhead = 8 } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'productId est obligatoire' },
        { status: 400 }
      )
    }

    const product = await Product.findById(productId).lean()

    if (!product) {
      return NextResponse.json(
        { error: 'Produit introuvable' },
        { status: 404 }
      )
    }

    const previousReorderPoint = Number((product as any).reorderPoint || 0)
    const previousSafetyStock = Number((product as any).safetyStock || 0)

    const twelveWeeksAgo = addWeeks(new Date(), -12)

    const orders = await Order.find({
      'items.productId': productId,
      status: { $in: ['confirmed', 'processing', 'shipped', 'delivered'] },
      createdAt: { $gte: twelveWeeksAgo },
    }).select('items createdAt')

    const weeklyDemand: Record<string, number> = {}

    for (const order of orders) {
      const weekKey = `${getYear(order.createdAt)}-W${String(
        getISOWeek(order.createdAt)
      ).padStart(2, '0')}`

      order.items.forEach((item: any) => {
        if (item.productId.toString() === productId) {
          weeklyDemand[weekKey] =
            (weeklyDemand[weekKey] || 0) + Number(item.quantity || 0)
        }
      })
    }

    let demandValues = Object.values(weeklyDemand)
    const usedSimulatedData = demandValues.length === 0

    if (usedSimulatedData) {
      demandValues = [3, 4, 5, 4, 6, 5, 4, 5]
    }

    const forecastValue = movingAverage(demandValues, 12)
    const stdDevDemand = stdDev(demandValues)
    const leadTimeDays = Number((product as any).leadTimeDays || 14)

    const safetyStock = calculateSafetyStock(
      1.65,
      stdDevDemand,
      leadTimeDays / 7
    )

    const rop = calculateROP(forecastValue / 7, leadTimeDays, safetyStock)

    const roundedSafetyStock = Math.round(safetyStock)
    const roundedRop = Math.round(rop)
    const roundedForecastValue = Math.max(0, Math.round(forecastValue))

    const forecasts = []

    for (let i = 1; i <= Number(weeksAhead); i++) {
      const weekDate = addWeeks(new Date(), i)

      const weekKey = `${getYear(weekDate)}-W${String(
        getISOWeek(weekDate)
      ).padStart(2, '0')}`

      const forecast = await Forecast.findOneAndUpdate(
        { productId, site, week: weekKey },
        {
          $set: {
            forecastedDemand: roundedForecastValue,
            modelName: 'moving_average_12w',
            generatedAt: new Date(),
          },
        },
        { upsert: true, new: true }
      ).lean()

      forecasts.push(forecast)
    }

    await Product.findByIdAndUpdate(productId, {
      $set: {
        reorderPoint: roundedRop,
        safetyStock: roundedSafetyStock,
      },
    })

    const { ipAddress, userAgent } = getRequestInfo(req)
    const user = auth.session.user as any

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'FORECAST_GENERATED',
      entity: 'Forecast',
      entityId: productId,
      metadata: {
        productId,
        site,
        weeksAhead: Number(weeksAhead),
        generatedForecastsCount: forecasts.length,
        modelName: 'moving_average_12w',
        avgWeeklyDemand: Math.round(forecastValue),
        stdDevDemand,
        historicalWeeks: Object.keys(weeklyDemand).length,
        usedSimulatedData,
      },
      ipAddress,
      userAgent,
    })

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'REORDER_POINT_UPDATED',
      entity: 'Product',
      entityId: productId,
      metadata: {
        productId,
        productName: (product as any).nameFr,
        sku: (product as any).sku,
        site,
        before: {
          reorderPoint: previousReorderPoint,
          safetyStock: previousSafetyStock,
        },
        after: {
          reorderPoint: roundedRop,
          safetyStock: roundedSafetyStock,
        },
        inputs: {
          leadTimeDays,
          serviceLevelZ: 1.65,
          avgWeeklyDemand: Math.round(forecastValue),
          stdDevDemand,
        },
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({
      forecasts,
      metrics: {
        avgWeeklyDemand: Math.round(forecastValue),
        safetyStock: roundedSafetyStock,
        rop: roundedRop,
        modelName: 'moving_average_12w',
        historicalWeeks: Object.keys(weeklyDemand).length,
        note: usedSimulatedData
          ? 'Aucune vente historique trouvée : données simulées utilisées pour démonstration.'
          : 'Prévision basée sur les ventes historiques.',
      },
    })
  } catch (error) {
    console.error('POST /api/forecast error:', error)

    return NextResponse.json(
      { error: 'Erreur serveur lors de la génération de la prévision' },
      { status: 500 }
    )
  }
}