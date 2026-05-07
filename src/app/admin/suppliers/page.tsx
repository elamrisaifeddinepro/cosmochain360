'use client'

import { useEffect, useState } from 'react'
import { supplierRiskScore } from '@/lib/utils'
import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react'

const GRADE_CONFIG = {
  A: { color: 'bg-green-100 text-green-700', icon: ShieldCheck, label: 'Faible risque' },
  B: { color: 'bg-yellow-100 text-yellow-700', icon: Shield, label: 'Risque modéré' },
  C: { color: 'bg-red-100 text-red-700', icon: ShieldAlert, label: 'Risque élevé' },
}

export default function AdminSuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/suppliers')
      .then((r) => r.json())
      .then((d) => {
        setSuppliers(Array.isArray(d) ? d : [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-neutral-900">Fournisseurs</h1>
        <div className="flex gap-2 text-xs font-body">
          {Object.entries(GRADE_CONFIG).map(([grade, { color, label }]) => (
            <span key={grade} className={`badge ${color} rounded`}>{grade} — {label}</span>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-body">
            <thead>
              <tr className="bg-neutral-50 border-b border-neutral-100">
                <th className="text-left px-4 py-3 text-neutral-500 font-medium">Fournisseur</th>
                <th className="text-left px-4 py-3 text-neutral-500 font-medium">Code SAP</th>
                <th className="text-right px-4 py-3 text-neutral-500 font-medium">OTD %</th>
                <th className="text-right px-4 py-3 text-neutral-500 font-medium">Qualité</th>
                <th className="text-right px-4 py-3 text-neutral-500 font-medium">Incidents</th>
                <th className="text-right px-4 py-3 text-neutral-500 font-medium">Écart prix %</th>
                <th className="text-right px-4 py-3 text-neutral-500 font-medium">Score</th>
                <th className="text-left px-4 py-3 text-neutral-500 font-medium">Grade</th>
                <th className="text-right px-4 py-3 text-neutral-500 font-medium">Délai (j)</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-neutral-50">
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 shimmer rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center text-neutral-400">
                    Aucun fournisseur enregistré
                  </td>
                </tr>
              ) : (
                suppliers.map((sup) => {
                  const { color, icon: Icon } = GRADE_CONFIG[sup.riskGrade as 'A' | 'B' | 'C'] || GRADE_CONFIG.B
                  return (
                    <tr key={sup._id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3">
                        <p className="font-medium text-neutral-800">{sup.name}</p>
                        <p className="text-xs text-neutral-400">{sup.contact?.email}</p>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-neutral-500">{sup.sapVendorCode || '—'}</td>
                      <td className={`px-4 py-3 text-right font-medium ${sup.otd < 80 ? 'text-red-600' : sup.otd < 90 ? 'text-amber-600' : 'text-green-600'}`}>
                        {sup.otd}%
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-700">{sup.qualityScore}</td>
                      <td className={`px-4 py-3 text-right ${sup.incidents > 3 ? 'text-red-600 font-medium' : 'text-neutral-700'}`}>
                        {sup.incidents}
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-700">{sup.priceVariance}%</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold text-base ${sup.riskScore >= 80 ? 'text-green-600' : sup.riskScore >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                          {sup.riskScore}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${color} rounded flex items-center gap-1 w-fit`}>
                          <Icon size={12} />
                          {sup.riskGrade}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-neutral-600">{sup.leadTimeDays}j</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-neutral-400 font-body">
        Score calculé : OTD (40%) + Qualité (35%) + Incidents (15%) + Écart prix (10%). Revue mensuelle recommandée.
      </p>
    </div>
  )
}
