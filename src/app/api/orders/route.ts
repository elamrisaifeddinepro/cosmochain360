import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Order from '@/models/Order'
import Inventory from '@/models/Inventory'
import { generateOrderNumber, calculateTaxes } from '@/lib/utils'
import { requireAuth } from '@/lib/auth-guards'
import { getRequestInfo, logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireAuth()

  if (!auth.authorized) {
    return auth.response
  }

  try {
    await dbConnect()

    const user = auth.session.user as any

    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 10)
    const status = searchParams.get('status')

    const query: any =
      user.role === 'admin' || user.role === 'manager'
        ? {}
        : { userId: user.id }

    if (status) {
      query.status = status
    }

    const [orders, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Order.countDocuments(query),
    ])

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/orders error:', error)

    return NextResponse.json(
      { error: 'Erreur serveur lors du chargement des commandes' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth()

  if (!auth.authorized) {
    return auth.response
  }

  try {
    await dbConnect()

    const user = auth.session.user as any
    const body = await req.json()

    const { items, shippingAddress, province = 'QC' } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Aucun article dans la commande' },
        { status: 400 }
      )
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Adresse de livraison obligatoire' },
        { status: 400 }
      )
    }

    const subtotal = items.reduce(
      (sum: number, item: any) =>
        sum + Number(item.price) * Number(item.quantity),
      0
    )

    const taxes = calculateTaxes(subtotal, province)
    const shippingCost = subtotal >= 75 ? 0 : 9.99
    const total = subtotal + taxes.gst + taxes.pst + shippingCost

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId: user.id,
      items,
      shippingAddress,
      subtotal,
      gst: taxes.gst,
      pst: taxes.pst,
      shippingCost,
      discount: 0,
      total,
      currency: 'CAD',
      status: 'pending',
      paymentStatus: 'pending',
    })

    for (const item of items) {
      await Inventory.findOneAndUpdate(
        { productId: item.productId },
        { $inc: { reserved: Number(item.quantity) } }
      )
    }

    const { ipAddress, userAgent } = getRequestInfo(req)

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'ORDER_CREATED',
      entity: 'Order',
      entityId: order._id.toString(),
      metadata: {
        orderNumber: order.orderNumber,
        total: order.total,
        subtotal: order.subtotal,
        gst: order.gst,
        pst: order.pst,
        shippingCost: order.shippingCost,
        itemCount: items.length,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('POST /api/orders error:', error)

    return NextResponse.json(
      { error: 'Erreur serveur lors de la création de la commande' },
      { status: 500 }
    )
  }
}