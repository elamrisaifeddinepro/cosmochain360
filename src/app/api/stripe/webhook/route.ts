import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import dbConnect from '@/lib/db'
import Order from '@/models/Order'
import Inventory from '@/models/Inventory'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-04-10' })

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature invalide' }, { status: 400 })
  }

  await dbConnect()

  switch (event.type) {
    case 'payment_intent.succeeded': {
      const pi = event.data.object as Stripe.PaymentIntent
      const order = await Order.findOneAndUpdate(
        { stripePaymentIntentId: pi.id },
        {
          paymentStatus: 'paid',
          status: 'confirmed',
          stripeChargeId: pi.latest_charge as string,
          contractSentAt: new Date(), // OPC compliance
        },
        { new: true }
      )

      if (order) {
        // Deduct real inventory
        for (const item of order.items) {
          await Inventory.findOneAndUpdate(
            { productId: item.productId },
            { $inc: { quantity: -item.quantity, reserved: -item.quantity } }
          )
        }
      }
      break
    }

    case 'payment_intent.payment_failed': {
      const pi = event.data.object as Stripe.PaymentIntent
      await Order.findOneAndUpdate(
        { stripePaymentIntentId: pi.id },
        { paymentStatus: 'failed', status: 'cancelled' }
      )
      break
    }

    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge
      await Order.findOneAndUpdate(
        { stripeChargeId: charge.id },
        { paymentStatus: 'refunded', status: 'refunded' }
      )
      break
    }
  }

  return NextResponse.json({ received: true })
}
