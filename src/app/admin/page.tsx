'use client'

import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { ShoppingCart, Package, TrendingUp, AlertTriangle, DollarSign, Users } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Stats {
  totalRevenue: number
  totalOrders: number
  pendingOrders: number
  lowStockCount: number
  topProducts: any[]
  revenueByDay: any[]
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - replace with real API calls
    setTimeout(() => {
      setStats({
        totalRevenue: 48320.50,
        totalOrders: 312,
        pendingOrders: 18,
        lowStockCount: 5,
        topProducts: [
          { name: 'Sérum Vitamine C', sales: 87 },
          { name: 'Crème Hydratante', sales: 65 },
          { name: 'Huile Rosehip', sales: 54 },
          { name: 'Masque Argile', sales: 43 },
          { name: 'Tonique Rose', sales: 38 },
        ],
        revenueByDay: [
          { day: 'Lun', revenue: 4200 },
          { day: 'Mar', revenue: 5800 },
          { day: 'Mer', revenue: 3900 },
          { day: 'Jeu', revenue: 6100 },
          { day: 'Ven', revenue: 7200 },
          { day: 'Sam', revenue: 8400 },
          { day: 'Dim', revenue: 5100 },
        ],
      })
      setLoading(false)
    }, 800)
  }, [])

  const kpis = stats
    ? [
        { label: 'Revenus (30j)', value: formatPrice(stats.totalRevenue), icon: DollarSign, color: 'bg-green-50 text-green-600' },
        { label: 'Commandes totales', value: stats.totalOrders, icon: ShoppingCart, color: 'bg-blue-50 text-blue-600' },
        { label: 'Commandes en attente', value: stats.pendingOrders, icon: Package, color: 'bg-amber-50 text-amber-600' },
        { label: 'Stocks faibles', value: stats.lowStockCount, icon: AlertTriangle, color: 'bg-red-50 text-red-600' },
      ]
    : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-neutral-900">Tableau de bord</h1>
        <span className="text-sm font-body text-neutral-400">
          {new Date().toLocaleDateString('fr-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </span>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card p-5 h-24 shimmer" />
            ))
          : kpis.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-body text-neutral-400">{label}</p>
                    <p className="text-2xl font-body font-bold text-neutral-900 mt-1">{value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded flex items-center justify-center ${color}`}>
                    <Icon size={20} />
                  </div>
                </div>
              </div>
            ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue chart */}
        <div className="card p-5">
          <h2 className="font-body font-semibold text-neutral-800 mb-4">Revenus cette semaine (CAD)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats?.revenueByDay || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
              <XAxis dataKey="day" tick={{ fontSize: 12, fontFamily: 'var(--font-dm-sans)' }} />
              <YAxis tick={{ fontSize: 12, fontFamily: 'var(--font-dm-sans)' }} tickFormatter={(v) => `${v/1000}k`} />
              <Tooltip formatter={(v: any) => formatPrice(v)} />
              <Bar dataKey="revenue" fill="#e05a2b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top products */}
        <div className="card p-5">
          <h2 className="font-body font-semibold text-neutral-800 mb-4">Top 5 produits (ventes)</h2>
          <div className="space-y-3">
            {stats?.topProducts.map((p, i) => (
              <div key={p.name} className="flex items-center gap-3">
                <span className="text-xs font-mono text-neutral-400 w-5">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-body text-neutral-700">{p.name}</span>
                    <span className="text-sm font-body font-medium text-neutral-900">{p.sales}</span>
                  </div>
                  <div className="h-1.5 bg-neutral-100 rounded-full">
                    <div
                      className="h-full bg-brand-400 rounded-full"
                      style={{ width: `${(p.sales / (stats?.topProducts[0]?.sales || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* BI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-5">
          <h3 className="font-body text-sm text-neutral-400 mb-1">Taux de service client</h3>
          <p className="font-display text-3xl font-bold text-green-600">97.2%</p>
          <p className="text-xs text-neutral-400 font-body mt-1">Objectif: ≥ 95%</p>
        </div>
        <div className="card p-5">
          <h3 className="font-body text-sm text-neutral-400 mb-1">Taux de rupture</h3>
          <p className="font-display text-3xl font-bold text-amber-500">2.1%</p>
          <p className="text-xs text-neutral-400 font-body mt-1">Objectif: &lt; 3%/mois ✓</p>
        </div>
        <div className="card p-5">
          <h3 className="font-body text-sm text-neutral-400 mb-1">MAPE prévision</h3>
          <p className="font-display text-3xl font-bold text-blue-600">14.8%</p>
          <p className="text-xs text-neutral-400 font-body mt-1">Objectif: ≤ 20% ✓</p>
        </div>
      </div>
    </div>
  )
}
