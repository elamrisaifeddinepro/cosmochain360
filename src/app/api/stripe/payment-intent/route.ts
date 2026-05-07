import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import dbConnect from '@/lib/db'
import Order from '@/models/Order'
import { requireAuth } from '@/lib/auth-guards'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export async function POST(req: NextRequest) {
  const auth = await requireAuth()

  if (!auth.authorized) {
    return auth.response
  }

  try {
    await dbConnect()

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Configuration Stripe manquante' },
        { status: 500 }
      )
    }

    const { orderId } = await req.json()

    if (!orderId) {
      return NextResponse.json(
        { error: 'orderId est obligatoire' },
        { status: 400 }
      )
    }

    const order = await Order.findById(orderId)

    if (!order) {
      return NextResponse.json(
        { error: 'Commande introuvable' },
        { status: 404 }
      )
    }

    const user = auth.session.user as any
    const isAdminOrManager = user.role === 'admin' || user.role === 'manager'
    const isOwner = String(order.userId || '') === String(user.id || '')

    if (!isAdminOrManager && !isOwner) {
      return NextResponse.json(
        { error: 'Accès refusé à cette commande' },
        { status: 403 }
      )
    }

    if (order.status === 'cancelled') {
      return NextResponse.json(
        { error: 'Impossible de payer une commande annulée' },
        { status: 400 }
      )
    }

    if (order.paymentStatus === 'paid') {
      return NextResponse.json(
        { error: 'Cette commande est déjà payée' },
        { status: 400 }
      )
    }

    const amount = Math.round(Number(order.total || 0) * 100)

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Montant de commande invalide' },
        { status: 400 }
      )
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'cad',
      metadata: {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        userId: String(user.id || ''),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    })

    order.stripePaymentIntentId = paymentIntent.id
    await order.save()

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    })
  } catch (error) {
    console.error('POST /api/stripe/payment-intent error:', error)

    return NextResponse.json(
      { error: 'Erreur serveur lors de la création du paiement' },
      { status: 500 }
    )
  }
}