import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import dbConnect from '@/lib/db'
import Order from '@/models/Order'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

export async function POST(req: NextRequest) {
  await dbConnect()
  const { orderId } = await req.json()

  const order = await Order.findById(orderId)
  if (!order) return NextResponse.json({ error: 'Commande introuvable' }, { status: 404 })

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.total * 100), // cents
    currency: 'cad',
    metadata: {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
    },
    automatic_payment_methods: { enabled: true },
  })

  await Order.findByIdAndUpdate(orderId, { stripePaymentIntentId: paymentIntent.id })

  return NextResponse.json({ clientSecret: paymentIntent.client_secret })
}
