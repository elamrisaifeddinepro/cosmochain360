import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Order from '@/models/Order'

const ALLOWED_STATUSES = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
]

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = session.user as any

    if (!['admin', 'manager'].includes(user.role)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 })
    }

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'ID commande invalide' },
        { status: 400 }
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

    return NextResponse.json(order)
  } catch (error) {
    console.error('PUT /api/orders/[id] error:', error)

    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour de la commande' },
      { status: 500 }
    )
  }
}