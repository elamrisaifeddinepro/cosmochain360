'use client'

import { useEffect, useState } from 'react'
import { formatDate, formatPrice } from '@/lib/utils'
import { Search, Filter } from 'lucide-react'

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  refunded: 'bg-neutral-100 text-neutral-500',
}

const STATUS_FR: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En traitement',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const params = new URLSearchParams()
    if (statusFilter) params.set('status', statusFilter)
    params.set('limit', '50')

    fetch(`/api/orders?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setOrders(d.orders || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [statusFilter])

  async function updateStatus(orderId: string, status: string) {
    await fetch(`/api/orders/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status } : o))
    )
  }

  const filtered = orders.filter(
    (o) =>
      !search ||
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.guestEmail?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-5">
      <h1 className="font-display text-2xl font-bold text-neutral-900">Commandes</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Numéro ou email..."
            className="input-field pl-9 w-64 text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-field w-auto text-sm"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_FR).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="text-left px-4 py-3 text-neutral-500 font-medium">Numéro</th>
                <th className="text-left px-4 py-3 text-neutral-500 font-medium">Client</th>
                <th className="text-left px-4 py-3 text-neutral-500 font-medium">Date</th>
                <th className="text-left px-4 py-3 text-neutral-500 font-medium">Total</th>
                <th className="text-left px-4 py-3 text-neutral-500 font-medium">Statut</th>
                <th className="text-left px-4 py-3 text-neutral-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-neutral-50">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 shimmer rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-neutral-400">
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                filtered.map((order) => (
                  <tr key={order._id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-neutral-600">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-neutral-600">
                      {order.guestEmail || order.userId?.email || '—'}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {order.createdAt ? formatDate(order.createdAt) : '—'}
                    </td>
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      {formatPrice(order.total || 0)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge ${STATUS_COLORS[order.status] || ''} rounded`}>
                        {STATUS_FR[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="text-xs border border-neutral-200 px-2 py-1 bg-white text-neutral-600"
                      >
                        {Object.entries(STATUS_FR).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
