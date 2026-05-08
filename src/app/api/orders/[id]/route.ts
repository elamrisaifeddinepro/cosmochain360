import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/db'
import Order from '@/models/Order'
import { requireAuth, requireManagerOrAdmin } from '@/lib/auth-guards'
import { getRequestInfo, logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const ALLOWED_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth()

  if (!auth.authorized) {
    return auth.response
  }

  try {
    await dbConnect()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'ID commande invalide' },
        { status: 400 }
      )
    }

    const user = auth.session.user as any

    const order = await Order.findById(params.id).lean()

    if (!order) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    const orderUserId = String((order as any).userId || '')
    const currentUserId = String(user.id || '')
    const isAdminOrManager = user.role === 'admin' || user.role === 'manager'
    const isOwner = orderUserId === currentUserId

    if (!isAdminOrManager && !isOwner) {
      return NextResponse.json(
        { error: 'Accès refusé' },
        { status: 403 }
      )
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error('GET /api/orders/[id] error:', error)

    return NextResponse.json(
      { error: 'Erreur serveur lors du chargement de la commande' },
      { status: 500 }
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireManagerOrAdmin()

  if (!auth.authorized) {
    return auth.response
  }

  try {
    await dbConnect()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'ID commande invalide' },
        { status: 400 }
      )
    }

    const previousOrder = await Order.findById(params.id).lean()

    if (!previousOrder) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    const body = await req.json()
    const { status, trackingNumber, carrier, notes } = body

    if (status && !ALLOWED_STATUSES.includes(status)) {
      return NextResponse.json(
        { error: 'Statut invalide' },
        { status: 400 }
      )
    }

    const update: any = {}

    if (status) update.status = status
    if (trackingNumber !== undefined) update.trackingNumber = trackingNumber
    if (carrier !== undefined) update.carrier = carrier
    if (notes !== undefined) update.notes = notes

    if (status === 'delivered') {
      update.deliveredAt = new Date()
    }

    const order = await Order.findByIdAndUpdate(
      params.id,
      { $set: update },
      { new: true }
    ).lean()

    if (!order) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    const { ipAddress, userAgent } = getRequestInfo(req)
    const user = auth.session.user as any

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'ORDER_STATUS_UPDATED',
      entity: 'Order',
      entityId: params.id,
      metadata: {
        orderNumber: (order as any).orderNumber,
        before: {
          status: (previousOrder as any).status,
          trackingNumber: (previousOrder as any).trackingNumber,
          carrier: (previousOrder as any).carrier,
          notes: (previousOrder as any).notes,
        },
        after: {
          status: (order as any).status,
          trackingNumber: (order as any).trackingNumber,
          carrier: (order as any).carrier,
          notes: (order as any).notes,
        },
        changedFields: Object.keys(update),
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('PUT /api/orders/[id] error:', error)

    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour de la commande' },
      { status: 500 }
    )
  }
}