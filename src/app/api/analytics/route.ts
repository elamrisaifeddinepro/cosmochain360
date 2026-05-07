import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Order from '@/models/Order'
import Product from '@/models/Product'
import Inventory from '@/models/Inventory'
import Supplier from '@/models/Supplier'
import { requireManagerOrAdmin } from '@/lib/auth-guards'

export const dynamic = 'force-dynamic'

export async function GET() {
  const auth = await requireManagerOrAdmin()

  if (!auth.authorized) {
    return auth.response
  }

  try {
    await dbConnect()

    const [orders, products, inventory, suppliers] = await Promise.all([
      Order.find().lean(),
      Product.find({ isActive: true }).lean(),
      Inventory.find()
        .populate(
          'productId',
          'nameFr category price reorderPoint safetyStock'
        )
        .lean(),
      Supplier.find({ isActive: true }).lean(),
    ])

    const paidOrders = orders.filter(
      (order: any) =>
        order.paymentStatus === 'paid' || order.status !== 'cancelled'
    )

    const totalRevenue = paidOrders.reduce(
      (sum: number, order: any) => sum + Number(order.total || 0),
      0
    )

    const totalOrders = orders.length
    const averageOrderValue =
      totalOrders > 0 ? totalRevenue / totalOrders : 0

    const lowStock = inventory.filter((inv: any) => {
      const available = Number(inv.quantity || 0) - Number(inv.reserved || 0)
      const reorderPoint = inv.productId?.reorderPoint || 10

      return available <= reorderPoint
    })

    const stockValue = inventory.reduce((sum: number, inv: any) => {
      const quantity = Number(inv.quantity || 0)
      const price = Number(inv.productId?.price || 0)

      return sum + quantity * price
    }, 0)

    const riskySuppliers = suppliers.filter(
      (supplier: any) =>
        supplier.riskGrade === 'C' || Number(supplier.riskScore || 0) < 70
    )

    const topProductsMap: Record<string, any> = {}

    orders.forEach((order: any) => {
      order.items?.forEach((item: any) => {
        const key = item.sku || item.productId

        if (!topProductsMap[key]) {
          topProductsMap[key] = {
            name: item.nameFr || item.name || 'Produit',
            quantity: 0,
            revenue: 0,
          }
        }

        topProductsMap[key].quantity += Number(item.quantity || 0)
        topProductsMap[key].revenue +=
          Number(item.price || 0) * Number(item.quantity || 0)
      })
    })

    const topProducts = Object.values(topProductsMap)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5)

    const stockByCategoryMap: Record<string, number> = {}

    inventory.forEach((inv: any) => {
      const category = inv.productId?.category || 'Autre'

      stockByCategoryMap[category] =
        (stockByCategoryMap[category] || 0) + Number(inv.quantity || 0)
    })

    const stockByCategory = Object.entries(stockByCategoryMap).map(
      ([name, value]) => ({
        name,
        value,
      })
    )

    const suppliersKpi = suppliers.map((supplier: any) => ({
      supplier: supplier.name,
      otd: supplier.otd || 0,
      qualityScore: supplier.qualityScore || 0,
      riskScore: supplier.riskScore || 0,
      riskGrade: supplier.riskGrade,
    }))

    return NextResponse.json({
      kpis: {
        totalRevenue,
        totalOrders,
        averageOrderValue,
        lowStockCount: lowStock.length,
        stockValue,
        riskySuppliersCount: riskySuppliers.length,
        activeProducts: products.length,
      },
      topProducts,
      stockByCategory,
      suppliersKpi,
    })
  } catch (error) {
    console.error('GET /api/analytics error:', error)

    return NextResponse.json(
      { error: 'Erreur serveur lors du chargement des analytics' },
      { status: 500 }
    )
  }
}