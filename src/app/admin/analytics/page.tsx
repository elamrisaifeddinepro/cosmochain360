'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { AlertTriangle, Boxes, DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

const COLORS = ['#d86b8f', '#f5c7d8', '#f7e7d3', '#b0a99f', '#403a31']

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then((res) => res.json())
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="card p-6">Chargement des analytics...</div>
  }

  const kpis = data?.kpis || {}

  const cards = [
    { label: 'CA total', value: formatPrice(kpis.totalRevenue || 0), icon: DollarSign },
    { label: 'Commandes', value: kpis.totalOrders || 0, icon: ShoppingCart },
    { label: 'Panier moyen', value: formatPrice(kpis.averageOrderValue || 0), icon: TrendingUp },
    { label: 'Stock critique', value: kpis.lowStockCount || 0, icon: AlertTriangle },
    { label: 'Valeur stock', value: formatPrice(kpis.stockValue || 0), icon: Boxes },
    { label: 'Produits actifs', value: kpis.activeProducts || 0, icon: Package },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold text-neutral-950">
          Analytique BI
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Vue décisionnelle basée sur les commandes, stocks, produits et fournisseurs.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">
        {cards.map(({ label, value, icon: Icon }) => (
          <div key={label} className="card p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-pink-50 text-brand-500">
              <Icon size={19} />
            </div>
            <p className="text-xs text-neutral-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-neutral-950">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-neutral-900">
            Top produits par revenus
          </h2>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.topProducts || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(v: any) => formatPrice(v)} />
              <Bar dataKey="revenue" fill="#d86b8f" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 font-semibold text-neutral-900">
            Stock par catégorie
          </h2>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data?.stockByCategory || []}
                dataKey="value"
                nameKey="name"
                outerRadius={90}
                label
              >
                {(data?.stockByCategory || []).map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 font-semibold text-neutral-900">
          Performance fournisseurs
        </h2>

        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data?.suppliersKpi || []} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
            <XAxis type="number" domain={[0, 100]} />
            <YAxis type="category" dataKey="supplier" width={110} tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="otd" fill="#d86b8f" name="OTD %" radius={[0, 6, 6, 0]} />
            <Bar dataKey="qualityScore" fill="#f5c7d8" name="Qualité" radius={[0, 6, 6, 0]} />
            <Bar dataKey="riskScore" fill="#403a31" name="Risque" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}