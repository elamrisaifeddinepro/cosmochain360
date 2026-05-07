'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Pencil, Eye, Power, ShieldCheck } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [q, setQ] = useState('')

  useEffect(() => {
    async function loadProducts() {
      setLoading(true)
      const res = await fetch('/api/products?limit=100')
      const data = await res.json()
      setProducts(data.products || [])
      setLoading(false)
    }

    loadProducts()
  }, [])

  const filteredProducts = products.filter((p) => {
    const value = `${p.nameFr} ${p.nameEn} ${p.sku} ${p.brand}`.toLowerCase()
    return value.includes(q.toLowerCase())
  })

  async function disableProduct(id: string) {
    const ok = confirm('Voulez-vous vraiment désactiver ce produit ?')
    if (!ok) return

    await fetch(`/api/products/${id}`, {
      method: 'DELETE',
    })

    setProducts((prev) => prev.filter((p) => p._id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-neutral-950">
            Produits
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            Gestion du catalogue cosmétique, conformité, prix et visibilité.
          </p>
        </div>

        <Link href="/admin/products/new" className="btn-primary">
          <Plus size={17} className="mr-2" />
          Nouveau produit
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
        <div className="card p-5">
          <p className="text-sm text-neutral-500">Total produits</p>
          <p className="mt-1 text-3xl font-bold text-neutral-950">
            {products.length}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-neutral-500">Produits actifs</p>
          <p className="mt-1 text-3xl font-bold text-green-600">
            {products.filter((p) => p.isActive).length}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-neutral-500">Produits vedettes</p>
          <p className="mt-1 text-3xl font-bold text-brand-500">
            {products.filter((p) => p.isFeatured).length}
          </p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-neutral-500">CNF renseigné</p>
          <p className="mt-1 text-3xl font-bold text-blue-600">
            {products.filter((p) => p.healthCanadaCnf).length}
          </p>
        </div>
      </div>

      <div className="card p-5">
        <div className="mb-5 flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h2 className="font-body text-lg font-semibold text-neutral-900">
              Catalogue produit
            </h2>
            <p className="text-sm text-neutral-500">
              {filteredProducts.length} produit(s) affiché(s)
            </p>
          </div>

          <div className="relative w-full md:w-80">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher produit, SKU, marque..."
              className="input-field pl-11"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl shimmer" />
            ))}
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-neutral-100">
            <table className="w-full text-left text-sm">
              <thead className="bg-neutral-50 text-xs uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-4 py-3">Produit</th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Prix</th>
                  <th className="px-4 py-3">Conformité</th>
                  <th className="px-4 py-3">Statut</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-neutral-100 bg-white">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-pink-50/40">
                    <td className="px-4 py-4">
                      <div>
                        <p className="font-semibold text-neutral-900">
                          {product.nameFr}
                        </p>
                        <p className="text-xs text-neutral-400">
                          {product.sku} · {product.brand}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-4 text-neutral-600">
                      {product.category}
                    </td>

                    <td className="px-4 py-4 font-semibold text-neutral-900">
                      {formatPrice(product.price)}
                    </td>

                    <td className="px-4 py-4">
                      {product.healthCanadaCnf ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                          <ShieldCheck size={13} />
                          CNF OK
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                          CNF manquant
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {product.isActive ? (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                          Actif
                        </span>
                      ) : (
                        <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
                          Inactif
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/shop/products/${product.slug}`}
                          className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900"
                          title="Voir"
                        >
                          <Eye size={17} />
                        </Link>

                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="rounded-full p-2 text-neutral-500 hover:bg-pink-50 hover:text-brand-500"
                          title="Modifier"
                        >
                          <Pencil size={17} />
                        </Link>

                        <button
                          onClick={() => disableProduct(product._id)}
                          className="rounded-full p-2 text-neutral-500 hover:bg-red-50 hover:text-red-600"
                          title="Désactiver"
                        >
                          <Power size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-neutral-400">
                      Aucun produit trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}