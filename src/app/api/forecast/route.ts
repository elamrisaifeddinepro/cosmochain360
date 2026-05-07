import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Forecast from '@/models/Forecast'
import Order from '@/models/Order'
import Product from '@/models/Product'
import { calculateROP, calculateSafetyStock } from '@/lib/utils'
import { getISOWeek, getYear, addWeeks } from 'date-fns'
import { requireManagerOrAdmin } from '@/lib/auth-guards'

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

    if (demandValues.length === 0) {
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
            forecastedDemand: Math.max(0, Math.round(forecastValue)),
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
        reorderPoint: Math.round(rop),
        safetyStock: Math.round(safetyStock),
      },
    })

    return NextResponse.json({
      forecasts,
      metrics: {
        avgWeeklyDemand: Math.round(forecastValue),
        safetyStock: Math.round(safetyStock),
        rop: Math.round(rop),
        modelName: 'moving_average_12w',
        historicalWeeks: Object.keys(weeklyDemand).length,
        note:
          Object.keys(weeklyDemand).length === 0
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