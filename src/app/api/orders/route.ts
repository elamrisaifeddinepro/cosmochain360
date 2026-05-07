import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Order from '@/models/Order'
import Inventory from '@/models/Inventory'
import { generateOrderNumber, calculateTaxes } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const user = session.user as any

    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 10)
    const status = searchParams.get('status')

    const query: any =
      user.role === 'admin' || user.role === 'manager'
        ? {}
        : { userId: user.id }

    if (status) query.status = status

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
  try {
    await dbConnect()

    const session = await getServerSession(authOptions)
    const body = await req.json()

    const { items, shippingAddress, province = 'QC' } = body

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Aucun article dans la commande' },
        { status: 400 }
      )
    }

    const subtotal = items.reduce(
      (sum: number, item: any) => sum + Number(item.price) * Number(item.quantity),
      0
    )

    const taxes = calculateTaxes(subtotal, province)
    const shippingCost = subtotal >= 75 ? 0 : 9.99
    const total = subtotal + taxes.gst + taxes.pst + shippingCost

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      userId: session ? (session.user as any).id : undefined,
      guestEmail: !session ? body.email : undefined,
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
        { $inc: { reserved: item.quantity } }
      )
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('POST /api/orders error:', error)

    return NextResponse.json(
      { error: 'Erreur serveur lors de la création de la commande' },
      { status: 500 }
    )
  }
}