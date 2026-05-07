import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Inventory from '@/models/Inventory'
import { requireManagerOrAdmin } from '@/lib/auth-guards'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = await requireManagerOrAdmin()

  if (!auth.authorized) {
    return auth.response
  }

  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)
    const site = searchParams.get('site') || 'MTL-01'
    const lowStock = searchParams.get('lowStock') === 'true'

    const inventories = await Inventory.find({ site })
      .populate('productId', 'nameFr nameEn sku reorderPoint safetyStock')
      .sort({ updatedAt: -1 })
      .lean()

    const normalized = inventories.map((inv: any) => ({
      ...inv,
      available: Math.max(
        0,
        Number(inv.quantity || 0) - Number(inv.reserved || 0)
      ),
    }))

    if (lowStock) {
      return NextResponse.json(
        normalized.filter(
          (inv: any) => inv.available <= (inv.productId?.reorderPoint || 10)
        )
      )
    }

    return NextResponse.json(normalized)
  } catch (error) {
    console.error('GET /api/inventory error:', error)

    return NextResponse.json(
      { error: "Erreur serveur lors du chargement de l'inventaire" },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  const auth = await requireManagerOrAdmin()

  if (!auth.authorized) {
    return auth.response
  }

  try {
    await dbConnect()

    const body = await req.json()
    const {
      productId,
      site = 'MTL-01',
      quantity,
      reserved,
      action = 'set',
    } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'productId est obligatoire' },
        { status: 400 }
      )
    }

    const current = await Inventory.findOne({ productId, site })

    const currentQuantity = Number(current?.quantity || 0)
    const currentReserved = Number(current?.reserved || 0)

    let nextQuantity = currentQuantity
    let nextReserved = currentReserved

    if (action === 'add') {
      nextQuantity = currentQuantity + Number(quantity || 0)
    } else if (action === 'remove') {
      nextQuantity = Math.max(0, currentQuantity - Number(quantity || 0))
    } else {
      nextQuantity = Number(quantity ?? currentQuantity)
      nextReserved = Number(reserved ?? currentReserved)
    }

    const nextAvailable = Math.max(0, nextQuantity - nextReserved)

    const inventory = await Inventory.findOneAndUpdate(
      { productId, site },
      {
        $set: {
          quantity: nextQuantity,
          reserved: nextReserved,
          available: nextAvailable,
          lastUpdated: new Date(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).populate('productId', 'nameFr nameEn sku reorderPoint safetyStock')

    return NextResponse.json(inventory)
  } catch (error) {
    console.error('PUT /api/inventory error:', error)

    return NextResponse.json(
      { error: "Erreur serveur lors de la mise à jour de l'inventaire" },
      { status: 500 }
    )
  }
}