import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import dbConnect from '@/lib/db'
import Product from '@/models/Product'
import { requireManagerOrAdmin } from '@/lib/auth-guards'
import { getRequestInfo, logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect()

    const identifier = params.id

    const query: any = mongoose.Types.ObjectId.isValid(identifier)
      ? { $or: [{ _id: identifier }, { slug: identifier }], isActive: true }
      : { slug: identifier, isActive: true }

    const product = await Product.findOne(query).lean()

    if (!product) {
      return NextResponse.json(
        { error: 'Produit introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('GET /api/products/[id] error:', error)

    return NextResponse.json(
      { error: 'Erreur serveur lors du chargement du produit' },
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
        { error: 'ID produit invalide' },
        { status: 400 }
      )
    }

    const body = await req.json()

    const previousProduct = await Product.findById(params.id).lean()

    if (!previousProduct) {
      return NextResponse.json(
        { error: 'Produit introuvable' },
        { status: 404 }
      )
    }

    const product = await Product.findByIdAndUpdate(
      params.id,
      { $set: body },
      {
        new: true,
        runValidators: false,
      }
    ).lean()

    if (!product) {
      return NextResponse.json(
        { error: 'Produit introuvable' },
        { status: 404 }
      )
    }

    const { ipAddress, userAgent } = getRequestInfo(req)
    const user = auth.session.user as any

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'PRODUCT_UPDATED',
      entity: 'Product',
      entityId: params.id,
      metadata: {
        before: {
          nameFr: (previousProduct as any).nameFr,
          sku: (previousProduct as any).sku,
          price: (previousProduct as any).price,
          category: (previousProduct as any).category,
          isActive: (previousProduct as any).isActive,
        },
        after: {
          nameFr: (product as any).nameFr,
          sku: (product as any).sku,
          price: (product as any).price,
          category: (product as any).category,
          isActive: (product as any).isActive,
        },
        changedFields: Object.keys(body),
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('PUT /api/products/[id] error:', error)

    return NextResponse.json(
      { error: 'Erreur serveur lors de la modification du produit' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
        { error: 'ID produit invalide' },
        { status: 400 }
      )
    }

    const previousProduct = await Product.findById(params.id).lean()

    if (!previousProduct) {
      return NextResponse.json(
        { error: 'Produit introuvable' },
        { status: 404 }
      )
    }

    const product = await Product.findByIdAndUpdate(
      params.id,
      { $set: { isActive: false } },
      { new: true }
    ).lean()

    if (!product) {
      return NextResponse.json(
        { error: 'Produit introuvable' },
        { status: 404 }
      )
    }

    const { ipAddress, userAgent } = getRequestInfo(req)
    const user = auth.session.user as any

    await logAudit({
      userId: user.id,
      userEmail: user.email,
      action: 'PRODUCT_DEACTIVATED',
      entity: 'Product',
      entityId: params.id,
      metadata: {
        nameFr: (previousProduct as any).nameFr,
        sku: (previousProduct as any).sku,
        category: (previousProduct as any).category,
        previousIsActive: (previousProduct as any).isActive,
        newIsActive: false,
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json({ message: 'Produit désactivé' })
  } catch (error) {
    console.error('DELETE /api/products/[id] error:', error)

    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression du produit' },
      { status: 500 }
    )
  }
}