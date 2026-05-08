import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Supplier from '@/models/Supplier'
import { supplierRiskScore } from '@/lib/utils'
import { requireManagerOrAdmin } from '@/lib/auth-guards'
import { getRequestInfo, logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireManagerOrAdmin()

  if (!auth.authorized) {
    return auth.response
  }

  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const grade = searchParams.get('grade')
    const active = searchParams.get('active')

    const query: any = {}

    if (grade) query.riskGrade = grade
    if (active !== null) query.isActive = active !== 'false'

    const suppliers = await Supplier.find(query)
      .sort({ riskScore: -1, name: 1 })
      .lean()

    return NextResponse.json(suppliers)
  } catch (error) {
    console.error('GET /api/suppliers error:', error)

    return NextResponse.json(
      { error: 'Erreur serveur lors du chargement des fournisseurs' },
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

    const { score, grade } = supplierRiskScore({
      otd: Number(body.otd || 100),
      qualityScore: Number(body.qualityScore || 100),
      incidents: Number(body.incidents || 0),
      priceVariance: Number(body.priceVariance || 0),
    })

    const supplier = await Supplier.create({
      ...body,
      riskScore: score,
      riskGrade: grade,
      isActive: body.isActive ?? true,
      lastReviewDate: body.lastReviewDate || new Date(),
    })

    const { ipAddress, userAgent } = getRequestInfo(req)
    const user = auth.session.user as any

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'SUPPLIER_CREATED',
      entity: 'Supplier',
      entityId: supplier._id.toString(),
      metadata: {
        name: supplier.name,
        sapVendorCode: supplier.sapVendorCode,
        otd: supplier.otd,
        qualityScore: supplier.qualityScore,
        incidents: supplier.incidents,
        priceVariance: supplier.priceVariance,
        riskScore: supplier.riskScore,
        riskGrade: supplier.riskGrade,
        isActive: supplier.isActive,
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json(supplier, { status: 201 })
  } catch (error) {
    console.error('POST /api/suppliers error:', error)

    return NextResponse.json(
      { error: 'Erreur serveur lors de la création du fournisseur' },
      { status: 500 }
    )
  }
}