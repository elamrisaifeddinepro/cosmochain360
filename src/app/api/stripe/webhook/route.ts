import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import dbConnect from '@/lib/db'
import Order from '@/models/Order'
import Inventory from '@/models/Inventory'

export const dynamic = 'force-dynamic'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
})

export async function POST(req: NextRequest) {
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Configuration Stripe manquante' },
      { status: 500 }
    )
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'Secret webhook Stripe manquant' },
      { status: 500 }
    )
  }

  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json(
      { error: 'Signature Stripe absente' },
      { status: 400 }
    )
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (error) {
    console.error('Stripe webhook signature error:', error)

    return NextResponse.json(
      { error: 'Webhook signature invalide' },
      { status: 400 }
    )
  }

  try {
    await dbConnect()

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        const order = await Order.findOne({
          stripePaymentIntentId: paymentIntent.id,
        })

        if (!order) {
          console.warn(
            `Aucune commande trouvée pour PaymentIntent ${paymentIntent.id}`
          )
          break
        }

        if (order.paymentStatus === 'paid') {
          console.info(
            `Commande ${order.orderNumber} déjà payée. Webhook ignoré.`
          )
          break
        }

        order.paymentStatus = 'paid'
        order.status = 'confirmed'
        order.stripeChargeId = paymentIntent.latest_charge as string
        order.contractSentAt = new Date()

        await order.save()

        for (const item of order.items) {
          const quantity = Number(item.quantity || 0)

          if (quantity <= 0) {
            continue
          }

          await Inventory.findOneAndUpdate(
            { productId: item.productId },
            {
              $inc: {
                quantity: -quantity,
                reserved: -quantity,
              },
            }
          )
        }

        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        await Order.findOneAndUpdate(
          { stripePaymentIntentId: paymentIntent.id },
          {
            $set: {
              paymentStatus: 'failed',
              status: 'cancelled',
            },
          }
        )

        break
      }

      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge

        await Order.findOneAndUpdate(
          { stripeChargeId: charge.id },
          {
            $set: {
              paymentStatus: 'refunded',
              status: 'refunded',
            },
          }
        )

        break
      }

      default: {
        console.info(`Stripe event non traité: ${event.type}`)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('POST /api/stripe/webhook error:', error)

    return NextResponse.json(
      { error: 'Erreur serveur lors du traitement du webhook Stripe' },
      { status: 500 }
    )
  }
}