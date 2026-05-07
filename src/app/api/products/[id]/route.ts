import { NextRequest, NextResponse } from 'next/server'
import mongoose from 'mongoose'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import Product from '@/models/Product'

async function requireAdminOrManager() {
  const session = await getServerSession(authOptions)

  if (!session) {
    return {
      error: NextResponse.json({ error: 'Non autorisé' }, { status: 401 }),
    }
  }

  const user = session.user as any

  if (!['admin', 'manager'].includes(user.role)) {
    return {
      error: NextResponse.json({ error: 'Accès refusé' }, { status: 403 }),
    }
  }

  return { session }
}

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
  try {
    const auth = await requireAdminOrManager()
    if (auth.error) return auth.error

    await dbConnect()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'ID produit invalide' },
        { status: 400 }
      )
    }

    const body = await req.json()

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
  try {
    const auth = await requireAdminOrManager()
    if (auth.error) return auth.error

    await dbConnect()

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'ID produit invalide' },
        { status: 400 }
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

    return NextResponse.json({ message: 'Produit désactivé' })
  } catch (error) {
    console.error('DELETE /api/products/[id] error:', error)

    return NextResponse.json(
      { error: 'Erreur serveur lors de la suppression du produit' },
      { status: 500 }
    )
  }
}