'use client'

import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp, RefreshCw, AlertCircle } from 'lucide-react'

export default function AdminForecastPage() {
  const [forecasts, setForecasts] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [selectedProduct, setSelectedProduct] = useState('')
  const [loading, setLoading] = useState(false)
  const [metrics, setMetrics] = useState<any>(null)

  useEffect(() => {
    fetch('/api/products?limit=100')
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
  }, [])

  async function loadForecasts() {
    if (!selectedProduct) return
    setLoading(true)
    const res = await fetch(`/api/forecast?productId=${selectedProduct}&weeks=12`)
    const data = await res.json()
    setForecasts(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function generateForecast() {
    if (!selectedProduct) return
    setLoading(true)
    const res = await fetch('/api/forecast', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: selectedProduct, weeksAhead: 8 }),
    })
    const data = await res.json()
    setMetrics(data.metrics)
    setForecasts(data.forecasts || [])
    setLoading(false)
  }

  const chartData = forecasts.map((f) => ({
    week: f.week,
    prévision: f.forecastedDemand,
    réel: f.actualDemand,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-neutral-900">Prévisions IA</h1>
        <span className="text-xs font-body text-neutral-400 bg-blue-50 text-blue-600 px-3 py-1 rounded">
          Modèle : Moyenne mobile 12 semaines
        </span>
      </div>

      {/* Selector */}
      <div className="card p-5 flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-48">
          <label className="block text-xs font-body text-neutral-400 mb-1">Produit</label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="input-field text-sm"
          >
            <option value="">Sélectionner un produit...</option>
            {products.map((p) => (
              <option key={p._id} value={p._id}>{p.nameFr} ({p.sku})</option>
            ))}
          </select>
        </div>
        <div className="flex gap-2 pt-4">
          <button
            onClick={loadForecasts}
            disabled={!selectedProduct || loading}
            className="btn-outline text-sm py-2.5 flex items-center gap-2"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            Charger
          </button>
          <button
            onClick={generateForecast}
            disabled={!selectedProduct || loading}
            className="btn-primary text-sm flex items-center gap-2"
          >
            <TrendingUp size={15} />
            Générer prévision
          </button>
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
          <div className="card p-4">
            <p className="text-xs text-neutral-400 font-body">Demande moy. / semaine</p>
            <p className="text-xl font-bold text-neutral-900 mt-1">{metrics.avgWeeklyDemand} unités</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-neutral-400 font-body">Stock de sécurité calculé</p>
            <p className="text-xl font-bold text-neutral-900 mt-1">{metrics.safetyStock} unités</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-neutral-400 font-body">ROP calculé</p>
            <p className="text-xl font-bold text-brand-500 mt-1">{metrics.rop} unités</p>
          </div>
          <div className="card p-4">
            <p className="text-xs text-neutral-400 font-body">Niveau de service cible</p>
            <p className="text-xl font-bold text-green-600 mt-1">95%</p>
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="card p-5">
          <h2 className="font-body font-semibold text-neutral-800 mb-4">
            Prévision vs Réel (SKU × Site × Semaine)
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0ede8" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fontFamily: 'var(--font-dm-sans)' }} angle={-30} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 12, fontFamily: 'var(--font-dm-sans)' }} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="prévision" stroke="#e05a2b" strokeWidth={2} strokeDasharray="5 5" dot />
              <Line type="monotone" dataKey="réel" stroke="#2d9c5f" strokeWidth={2} dot />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-neutral-400 font-body mt-3">
            Objectif MAPE ≤ 20% sur le top 80% des SKUs (conforme critères d'acceptation CosmoChain 360)
          </p>
        </div>
      ) : selectedProduct ? (
        <div className="card p-10 text-center">
          <AlertCircle size={32} className="text-neutral-300 mx-auto mb-3" />
          <p className="text-neutral-400 font-body">Cliquez sur "Générer prévision" pour lancer l'analyse IA</p>
        </div>
      ) : null}

      {/* Info */}
      <div className="card p-5 bg-blue-50 border-blue-100">
        <h3 className="font-body font-semibold text-blue-800 mb-2">Méthodologie IA</h3>
        <div className="text-sm text-blue-700 font-body space-y-1">
          <p>• <strong>Modèle</strong> : Moyenne mobile pondérée sur 12 semaines glissantes</p>
          <p>• <strong>ROP</strong> = Demande_moy_jour × Délai_appro + Stock_sécurité</p>
          <p>• <strong>Stock sécurité</strong> = z(95%) × σ_demande × √délai_semaines</p>
          <p>• <strong>Validation</strong> : Backtest glissant, MAPE calculé sur données historiques réelles</p>
          <p>• <strong>Re-training</strong> : Mensuel automatique (Phase 3 — MLOps)</p>
        </div>
      </div>
    </div>
  )
}
