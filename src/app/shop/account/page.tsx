'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { formatDate, formatPrice } from '@/lib/utils'
import { Package, User } from 'lucide-react'

const STATUS_FR: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmée',
  processing: 'En traitement',
  shipped: 'Expédiée',
  delivered: 'Livrée',
  cancelled: 'Annulée',
  refunded: 'Remboursée',
}

export default function AccountPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/auth/login')
  }, [status])

  useEffect(() => {
    if (session) {
      fetch('/api/orders?limit=20')
        .then((r) => r.json())
        .then((d) => {
          setOrders(d.orders || [])
          setLoading(false)
        })
        .catch(() => setLoading(false))
    }
  }, [session])

  if (status === 'loading') return null

  return (
    <div className="page-container py-10">
      <h1 className="section-title mb-8">Mon compte</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-brand-100 rounded flex items-center justify-center">
              <User size={20} className="text-brand-500" />
            </div>
            <div>
              <p className="font-body font-semibold text-neutral-800">{session?.user?.name}</p>
              <p className="text-xs text-neutral-400">{session?.user?.email}</p>
            </div>
          </div>
          <hr className="border-neutral-100 my-4" />
          <p className="text-xs text-neutral-400 font-body">
            Votre compte est protégé conformément à la Loi 25 du Québec.
            Vos données ne sont jamais vendues à des tiers.
          </p>
        </div>

        {/* Orders */}
        <div className="md:col-span-2">
          <h2 className="font-body font-semibold text-neutral-900 mb-4 flex items-center gap-2">
            <Package size={18} className="text-brand-500" />
            Mes commandes
          </h2>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 shimmer rounded" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="card p-8 text-center">
              <p className="text-neutral-400 font-body">Vous n'avez pas encore de commandes</p>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order._id} className="card p-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-mono text-xs text-neutral-500">{order.orderNumber}</p>
                    <p className="font-body text-sm text-neutral-700 mt-0.5">
                      {order.items?.length} article(s)
                    </p>
                    <p className="text-xs text-neutral-400">{order.createdAt ? formatDate(order.createdAt) : '—'}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-body font-semibold text-neutral-900">{formatPrice(order.total || 0)}</p>
                    <span className="badge bg-neutral-100 text-neutral-600 rounded mt-1">
                      {STATUS_FR[order.status] || order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
