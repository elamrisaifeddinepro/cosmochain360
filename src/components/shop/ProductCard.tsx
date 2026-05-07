'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Heart, Sparkles } from 'lucide-react'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { formatPrice } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ProductCardProps {
  product: {
    _id: string
    slug: string
    nameFr: string
    nameEn: string
    price: number
    compareAtPrice?: number
    images: string[]
    brand: string
    category: string
    pao: string
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const { dispatch } = useCart()
  const { lang, t } = useLanguage()

  const name = lang === 'fr' ? product.nameFr : product.nameEn
  const discount = product.compareAtPrice
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0

  function addToCart() {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        productId: product._id,
        nameFr: product.nameFr,
        nameEn: product.nameEn,
        sku: product._id,
        price: product.price,
        quantity: 1,
        image: product.images[0] || '/placeholder.jpg',
      },
    })

    toast.success(t('Ajouté au panier', 'Added to cart'))
  }

  return (
    <article className="group card overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-pink-100">
      <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-pink-50 via-white to-orange-50">
        <Link href={`/shop/products/${product.slug}`}>
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center text-brand-300">
                <Sparkles size={44} className="mx-auto mb-3" />
                <span className="font-display text-3xl">Cosmo</span>
              </div>
            </div>
          )}
        </Link>

        <div className="absolute left-3 top-3 flex flex-col gap-2">
          {discount > 0 && (
            <span className="badge bg-brand-500 text-white shadow-md">
              -{discount}%
            </span>
          )}

          <span className="badge bg-white/85 text-neutral-700 shadow-sm backdrop-blur">
            PAO {product.pao}
          </span>
        </div>

        <button
          type="button"
          className="absolute right-3 top-3 rounded-full bg-white/85 p-2.5 text-neutral-600 shadow-sm backdrop-blur transition-all hover:bg-white hover:text-brand-500"
          aria-label="Wishlist"
        >
          <Heart size={18} />
        </button>

        <button
          onClick={addToCart}
          className="absolute inset-x-4 bottom-4 flex translate-y-3 items-center justify-center gap-2 rounded-full bg-neutral-950/90 py-3 text-sm font-semibold text-white opacity-0 shadow-xl backdrop-blur transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <ShoppingBag size={16} />
          {t('Ajouter au panier', 'Add to cart')}
        </button>
      </div>

      <div className="p-5">
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">
          {product.brand}
        </p>

        <Link href={`/shop/products/${product.slug}`}>
          <h3 className="line-clamp-2 min-h-[42px] text-sm font-semibold leading-snug text-neutral-950 transition-colors hover:text-brand-500">
            {name}
          </h3>
        </Link>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-base font-bold text-neutral-950">
            {formatPrice(product.price)}
          </span>

          {product.compareAtPrice && (
            <span className="text-sm text-neutral-400 line-through">
              {formatPrice(product.compareAtPrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}