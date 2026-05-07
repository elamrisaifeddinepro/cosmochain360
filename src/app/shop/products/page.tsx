'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { ProductCard } from '@/components/shop/ProductCard'
import { SlidersHorizontal } from 'lucide-react'
import { useLanguage } from '@/context/LanguageContext'

const categories = [
  { slug: '', fr: 'Toutes catégories', en: 'All categories' },
  { slug: 'soin-visage', fr: 'Soin Visage', en: 'Face Care' },
  { slug: 'soin-corps', fr: 'Soin Corps', en: 'Body Care' },
  { slug: 'maquillage', fr: 'Maquillage', en: 'Makeup' },
  { slug: 'soin-cheveux', fr: 'Soin Cheveux', en: 'Hair Care' },
  { slug: 'parfumerie', fr: 'Parfumerie', en: 'Fragrance' },
  { slug: 'solaire', fr: 'Solaire', en: 'Sun Care' },
]

const skinTypes = ['normal', 'sec', 'gras', 'mixte', 'sensible']

const sortOptions = [
  { value: 'createdAt', fr: 'Nouveautés', en: 'Newest' },
  { value: 'price_asc', fr: 'Prix croissant', en: 'Price: low to high' },
  { value: 'price_desc', fr: 'Prix décroissant', en: 'Price: high to low' },
  { value: 'name', fr: 'Nom A-Z', en: 'Name A-Z' },
]

function ProductsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { lang, t } = useLanguage()

  const [products, setProducts] = useState<any[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [filtersOpen, setFiltersOpen] = useState(false)

  const category = searchParams.get('category') || ''
  const skinType = searchParams.get('skinType') || ''
  const sort = searchParams.get('sort') || 'createdAt'
  const q = searchParams.get('q') || ''
  const page = Number(searchParams.get('page') || 1)

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true)

      try {
        const params = new URLSearchParams()

        if (category) params.set('category', category)
        if (skinType) params.set('skinType', skinType)
        if (sort) params.set('sort', sort)
        if (q) params.set('q', q)

        params.set('page', String(page))
        params.set('limit', '12')

        const res = await fetch(`/api/products?${params.toString()}`)
        const data = await res.json()

        setProducts(data.products || [])
        setPagination(
          data.pagination || {
            page: 1,
            pages: 1,
            total: 0,
          }
        )
      } catch (error) {
        console.error('Erreur chargement produits:', error)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [category, skinType, sort, q, page])

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }

    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="page-container py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="section-title">
            {category
              ? categories.find((c) => c.slug === category)?.[lang] ||
                t('Produits', 'Products')
              : t('Tous nos produits', 'All products')}
          </h1>

          {q && (
            <p className="text-neutral-500 font-body mt-1">
              Résultats pour "{q}"
            </p>
          )}

          <p className="text-neutral-400 font-body text-sm mt-1">
            {pagination.total} produit(s)
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="input-field w-auto text-sm"
          >
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {lang === 'fr' ? option.fr : option.en}
              </option>
            ))}
          </select>

          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="flex items-center gap-2 btn-outline text-sm py-2.5"
          >
            <SlidersHorizontal size={16} />
            {t('Filtres', 'Filters')}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        <aside
          className={`w-56 flex-shrink-0 ${
            filtersOpen ? 'block' : 'hidden lg:block'
          }`}
        >
          <div className="card p-5 sticky top-20">
            <h3 className="font-body font-semibold text-neutral-800 mb-4">
              {t('Catégories', 'Categories')}
            </h3>

            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <button
                    onClick={() => updateFilter('category', cat.slug)}
                    className={`w-full text-left text-sm py-1.5 px-2 font-body transition-colors ${
                      category === cat.slug
                        ? 'text-brand-500 bg-brand-50 font-medium'
                        : 'text-neutral-600 hover:text-brand-500'
                    }`}
                  >
                    {lang === 'fr' ? cat.fr : cat.en}
                  </button>
                </li>
              ))}
            </ul>

            <hr className="my-4 border-neutral-100" />

            <h3 className="font-body font-semibold text-neutral-800 mb-4">
              {t('Type de peau', 'Skin type')}
            </h3>

            <ul className="space-y-1">
              {skinTypes.map((st) => (
                <li key={st}>
                  <button
                    onClick={() =>
                      updateFilter('skinType', skinType === st ? '' : st)
                    }
                    className={`w-full text-left text-sm py-1.5 px-2 font-body capitalize transition-colors ${
                      skinType === st
                        ? 'text-brand-500 bg-brand-50 font-medium'
                        : 'text-neutral-600 hover:text-brand-500'
                    }`}
                  >
                    {st}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="card aspect-[3/4] shimmer" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="font-display text-2xl text-neutral-400 mb-3">
                Aucun produit trouvé
              </p>

              <button
                onClick={() => router.push('/shop/products')}
                className="btn-primary"
              >
                Effacer les filtres
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map((product: any) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from(
                    { length: pagination.pages },
                    (_, index) => index + 1
                  ).map((p) => (
                    <button
                      key={p}
                      onClick={() => updateFilter('page', String(p))}
                      className={`w-9 h-9 text-sm font-body border transition-colors ${
                        p === pagination.page
                          ? 'bg-brand-500 text-white border-brand-500'
                          : 'border-neutral-200 text-neutral-600 hover:border-brand-300'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="page-container py-10">
          Chargement des produits...
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  )
}