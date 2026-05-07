import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Product from '@/models/Product'
import { slugify } from '@/lib/utils'
import { requireManagerOrAdmin } from '@/lib/auth-guards'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const { searchParams } = new URL(req.url)

    const page = Number(searchParams.get('page') || 1)
    const limit = Number(searchParams.get('limit') || 12)
    const category = searchParams.get('category')
    const skinType = searchParams.get('skinType')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const search = searchParams.get('q')
    const sort = searchParams.get('sort') || 'createdAt'
    const featured = searchParams.get('featured')

    const query: any = { isActive: true }

    if (category) query.category = category
    if (skinType) query.skinTypes = skinType
    if (featured === 'true') query.isFeatured = true

    if (minPrice || maxPrice) {
      query.price = {}

      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }

    if (search) {
      query.$text = { $search: search }
    }

    const sortOptions: any = {
      createdAt: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
      name: { nameFr: 1 },
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .sort(sortOptions[sort] || sortOptions.createdAt)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      Product.countDocuments(query),
    ])

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('GET /api/products error:', error)

    return NextResponse.json(
      { error: 'Erreur lors du chargement des produits' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireManagerOrAdmin()

  if (!auth.authorized) {
    return auth.response
  }

  try {
    await dbConnect()

    const body = await req.json()

    const product = await Product.create({
      ...body,
      slug: body.slug || slugify(body.nameFr),
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('POST /api/products error:', error)

    return NextResponse.json(
      { error: 'Erreur lors de la création du produit' },
      { status: 500 }
    )
  }
}