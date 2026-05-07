'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, RefreshCw, TrendingUp } from 'lucide-react'

export default function AdminInventoryPage() {
  const [inventory, setInventory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'low'>('all')

  useEffect(() => {
    const url = filter === 'low' ? '/api/inventory?lowStock=true' : '/api/inventory'
    fetch(url)
      .then((r) => r.json())
      .then((d) => {
        setInventory(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [filter])

  async function runForecast(productId: string) {
    await fetch('/api/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    })
    alert('Prévision générée avec succès !')
  }

  const lowStockCount = inventory.filter(
    (inv) => inv.available <= (inv.productId?.reorderPoint || 10)
  ).length

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-neutral-900">Inventaire</h1>
        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-3 py-2 rounded text-sm font-body">
            <AlertTriangle size={16} />
            {lowStockCount} produit(s) sous le point de réassort
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {[{ value: 'all', label: 'Tout le stock' }, { value: 'low', label: '⚠ Stocks faibles' }].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setFilter(value as any)}
            className={`px-4 py-2 text-sm font-body border transition-colors ${
              filter === value
                ? 'bg-neutral-900 text-white border-neutral-900'
                : 'border-neutral-200 text-neutral-600 hover:border-neutral-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="text-left px-4 py-3 text-neutral-500 font-medium">Produit</th>
                <th className="text-left px-4 py-3 text-neutral-500 font-medium">SKU</th>
                <th className="text-right px-4 py-3 text-neutral-500 font-medium">Disponible</th>
                <th className="text-right px-4 py-3 text-neutral-500 font-medium">Réservé</th>
                <th className="text-right px-4 py-3 text-neutral-500 font-medium">Total</th>
                <th className="text-right px-4 py-3 text-neutral-500 font-medium">ROP</th>
                <th className="text-right px-4 py-3 text-neutral-500 font-medium">Stock séc.</th>
                <th className="text-left px-4 py-3 text-neutral-500 font-medium">Statut</th>
                <th className="text-left px-4 py-3 text-neutral-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="border-b border-neutral-50">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 shimmer rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-neutral-400">
                    Aucune donnée d'inventaire
                  </td>
                </tr>
              ) : (
                inventory.map((inv) => {
                  const product = inv.productId
                  const rop = product?.reorderPoint || 10
                  const isLow = inv.available <= rop
                  const isCritical = inv.available <= (product?.safetyStock || 5)

                  return (
                    <tr key={inv._id} className={`border-b border-neutral-50 transition-colors ${isLow ? 'bg-red-50/50' : 'hover:bg-neutral-50'}`}>
                      <td className="px-4 py-3 font-medium text-neutral-800">
                        {product?.nameFr || '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-500">{product?.sku || '—'}</td>
                      <td className={`px-4 py-3 text-right font-semibold ${isCritical ? 'text-red-600' : isLow ? 'text-amber-600' : 'text-neutral-900'}`}>
                        {inv.available}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-500">{inv.reserved}</td>
                      <td className="px-4 py-3 text-right text-neutral-700">{inv.quantity}</td>
                      <td className="px-4 py-3 text-right text-neutral-500">{rop}</td>
                      <td className="px-4 py-3 text-right text-neutral-500">{product?.safetyStock || 5}</td>
                      <td className="px-4 py-3">
                        {isCritical ? (
                          <span className="badge bg-red-100 text-red-700 rounded">Critique</span>
                        ) : isLow ? (
                          <span className="badge bg-amber-100 text-amber-700 rounded">Réassort</span>
                        ) : (
                          <span className="badge bg-green-100 text-green-700 rounded">OK</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => runForecast(product?._id)}
                          title="Générer prévision IA"
                          className="text-brand-500 hover:text-brand-700 transition-colors"
                        >
                          <TrendingUp size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
