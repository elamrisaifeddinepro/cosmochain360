import { NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import Order from '@/models/Order'
import Product from '@/models/Product'
import Inventory from '@/models/Inventory'
import Supplier from '@/models/Supplier'

export async function GET() {
  try {
    await dbConnect()

    const [orders, products, inventory, suppliers] = await Promise.all([
      Order.find().lean(),
      Product.find({ isActive: true }).lean(),
      Inventory.find().populate('productId', 'nameFr category price reorderPoint safetyStock').lean(),
      Supplier.find({ isActive: true }).lean(),
    ])

    const paidOrders = orders.filter((o: any) => o.paymentStatus === 'paid' || o.status !== 'cancelled')

    const totalRevenue = paidOrders.reduce((sum: number, o: any) => sum + Number(o.total || 0), 0)
    const totalOrders = orders.length
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

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

    const riskySuppliers = suppliers.filter((s: any) => s.riskGrade === 'C' || Number(s.riskScore || 0) < 70)

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
        topProductsMap[key].revenue += Number(item.price || 0) * Number(item.quantity || 0)
      })
    })

    const topProducts = Object.values(topProductsMap)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 5)

    const stockByCategoryMap: Record<string, number> = {}

    inventory.forEach((inv: any) => {
      const category = inv.productId?.category || 'Autre'
      stockByCategoryMap[category] = (stockByCategoryMap[category] || 0) + Number(inv.quantity || 0)
    })

    const stockByCategory = Object.entries(stockByCategoryMap).map(([name, value]) => ({
      name,
      value,
    }))

    const suppliersKpi = suppliers.map((s: any) => ({
      supplier: s.name,
      otd: s.otd || 0,
      qualityScore: s.qualityScore || 0,
      riskScore: s.riskScore || 0,
      riskGrade: s.riskGrade,
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