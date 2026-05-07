'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import {
  ShoppingBag,
  ChevronDown,
  ChevronUp,
  Shield,
  Leaf,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ProductDetailPage() {
  const params = useParams()
  const slug = params?.slug as string

  const { dispatch } = useCart()
  const { lang, t } = useLanguage()

  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)
  const [qty, setQty] = useState(1)
  const [inciOpen, setInciOpen] = useState(false)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        setError('')

        const res = await fetch(`/api/products/${slug}`)

        if (!res.ok) {
          throw new Error('Produit introuvable')
        }

        const data = await res.json()

        if (!data || data.error) {
          throw new Error(data.error || 'Produit introuvable')
        }

        setProduct(data)

        if (data.variants?.length) {
          setSelectedVariant(data.variants[0])
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement du produit')
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }

    if (slug) fetchProduct()
  }, [slug])

  if (loading) {
    return (
      <div className="page-container py-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          <div className="aspect-square rounded-[2rem] shimmer" />
          <div className="space-y-5">
            <div className="h-6 w-32 rounded-full shimmer" />
            <div className="h-12 w-3/4 rounded-full shimmer" />
            <div className="h-8 w-28 rounded-full shimmer" />
            <div className="h-28 w-full rounded-3xl shimmer" />
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="page-container py-24 text-center">
        <div className="mx-auto max-w-md rounded-[2rem] border border-red-100 bg-white p-8 shadow-sm">
          <AlertTriangle className="mx-auto mb-4 text-red-500" size={38} />
          <h1 className="mb-2 font-display text-3xl font-bold text-neutral-950">
            Produit introuvable
          </h1>
          <p className="text-neutral-500">{error}</p>
        </div>
      </div>
    )
  }

  const name = lang === 'fr' ? product.nameFr : product.nameEn
  const description = lang === 'fr' ? product.descriptionFr : product.descriptionEn
  const usage = lang === 'fr' ? product.usageFr : product.usageEn
  const importer = lang === 'fr' ? product.importerFr : product.importerEn
  const price = selectedVariant?.price || product.price
  const images = product.images || []

  function addToCart() {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: product._id,
        variantId: selectedVariant?._id,
        nameFr: product.nameFr,
        nameEn: product.nameEn,
        sku: selectedVariant?.sku || product.sku || product._id,
        price,
        quantity: qty,
        image: images[0] || '/placeholder.jpg',
      },
    })

    toast.success(t('Ajouté au panier !', 'Added to cart!'))
  }

  return (
    <div className="page-container py-12">
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
        <div>
          <div className="relative mb-4 aspect-square overflow-hidden rounded-[2rem] bg-gradient-to-br from-pink-50 via-white to-orange-50 shadow-sm">
            {images[activeImage] ? (
              <Image
                src={images[activeImage]}
                alt={name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <div className="text-center text-brand-300">
                  <Sparkles size={64} className="mx-auto mb-4" />
                  <p className="font-display text-5xl">Cosmo</p>
                </div>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-20 w-20 overflow-hidden rounded-2xl border-2 ${
                    i === activeImage ? 'border-brand-500' : 'border-neutral-200'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-[2rem] bg-white/80 p-8 shadow-sm">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-500">
            {product.brand}
          </p>

          <h1 className="mb-4 font-display text-4xl font-bold leading-tight text-neutral-950">
            {name}
          </h1>

          <div className="mb-6 flex items-center gap-3">
            <span className="text-3xl font-bold text-neutral-950">
              {formatPrice(price)}
            </span>

            {product.compareAtPrice && (
              <span className="text-lg text-neutral-400 line-through">
                {formatPrice(product.compareAtPrice)}
              </span>
            )}
          </div>

          {product.variants?.length > 0 && (
            <div className="mb-6">
              <p className="mb-2 text-sm font-semibold text-neutral-700">
                {t('Variante', 'Variant')}
              </p>

              <div className="flex flex-wrap gap-2">
                {product.variants.map((v: any) => (
                  <button
                    key={v._id}
                    onClick={() => setSelectedVariant(v)}
                    className={`rounded-full border px-4 py-2 text-sm transition-all ${
                      selectedVariant?._id === v._id
                        ? 'border-brand-500 bg-pink-50 text-brand-600'
                        : 'border-neutral-200 text-neutral-600 hover:border-brand-300'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 flex items-center gap-3">
            <div className="flex items-center rounded-full border border-neutral-200 bg-white">
              <button
                onClick={() => setQty(Math.max(1, qty - 1))}
                className="px-4 py-3 text-neutral-600 hover:text-brand-500"
              >
                −
              </button>

              <span className="min-w-[3rem] px-3 py-3 text-center font-semibold">
                {qty}
              </span>

              <button
                onClick={() => setQty(qty + 1)}
                className="px-4 py-3 text-neutral-600 hover:text-brand-500"
              >
                +
              </button>
            </div>

            <button onClick={addToCart} className="btn-primary flex-1">
              <ShoppingBag size={18} className="mr-2" />
              {t('Ajouter au panier', 'Add to cart')}
            </button>
          </div>

          <p className="mb-6 leading-relaxed text-neutral-600">{description}</p>

          <div className="mb-5 border-t border-neutral-100 pt-5">
            <h3 className="mb-2 font-semibold text-neutral-800">
              {t("Mode d'emploi", 'How to use')}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-600">{usage}</p>
          </div>

          <div className="mb-5 border-t border-neutral-100 pt-5">
            <button
              onClick={() => setInciOpen(!inciOpen)}
              className="flex w-full items-center justify-between font-semibold text-neutral-800"
            >
              <span className="flex items-center gap-2">
                <Leaf size={17} className="text-brand-500" />
                {t('Liste INCI des ingrédients', 'INCI ingredient list')}
              </span>
              {inciOpen ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
            </button>

            {inciOpen && (
              <p className="mt-3 rounded-2xl bg-neutral-50 p-4 font-mono text-xs leading-relaxed text-neutral-500">
                {product.inci}
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-pink-100 bg-pink-50/60 p-4 text-sm text-neutral-600">
            <div className="mb-2 flex items-center gap-2 font-semibold text-neutral-800">
              <Shield size={16} className="text-brand-500" />
              Conformité produit
            </div>

            <p>PAO : {product.pao}</p>
            <p>
              {lang === 'fr' ? 'Importé par' : 'Imported by'} : {importer}
            </p>

            {product.healthCanadaCnf && (
              <p>Santé Canada CNF : {product.healthCanadaCnf}</p>
            )}

            {product.warnings?.length > 0 && (
              <p className="mt-2 text-amber-700">
                ⚠ {product.warnings.join(' | ')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}