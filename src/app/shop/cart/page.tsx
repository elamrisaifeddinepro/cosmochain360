'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { formatPrice, calculateTaxes } from '@/lib/utils'
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react'

export default function CartPage() {
  const { state, dispatch } = useCart()
  const { lang, t } = useLanguage()

  const shipping = state.subtotal >= 75 ? 0 : 9.99
  const taxes = calculateTaxes(state.subtotal, 'QC')
  const total = state.subtotal + taxes.gst + taxes.pst + shipping

  if (state.items.length === 0) {
    return (
      <div className="page-container py-20 text-center">
        <ShoppingBag size={48} className="text-neutral-300 mx-auto mb-4" />
        <h1 className="font-display text-2xl font-bold text-neutral-800 mb-3">
          {t('Votre panier est vide', 'Your cart is empty')}
        </h1>
        <p className="text-neutral-500 font-body mb-6">
          {t('Découvrez nos produits cosmétiques premium', 'Discover our premium cosmetics')}
        </p>
        <Link href="/shop/products" className="btn-primary">
          {t('Continuer les achats', 'Continue shopping')}
        </Link>
      </div>
    )
  }

  return (
    <div className="page-container py-10">
      <h1 className="section-title mb-8">{t('Mon panier', 'My cart')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {state.items.map((item) => (
            <div key={`${item.productId}-${item.variantId}`} className="card p-4 flex gap-4">
              <div className="relative w-20 h-20 flex-shrink-0 bg-neutral-100">
                {item.image ? (
                  <Image src={item.image} alt={item.nameFr} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300 text-xl">✦</div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-body font-medium text-neutral-900 text-sm truncate">
                  {lang === 'fr' ? item.nameFr : item.nameEn}
                </h3>
                <p className="text-xs text-neutral-400 font-body mt-0.5">{item.sku}</p>
                <p className="font-body font-semibold text-neutral-900 mt-1">{formatPrice(item.price)}</p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <button
                  onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.productId })}
                  className="text-neutral-300 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>

                <div className="flex items-center border border-neutral-200">
                  <button
                    onClick={() => dispatch({ type: 'UPDATE_QTY', payload: { productId: item.productId, quantity: item.quantity - 1 } })}
                    className="px-2 py-1 text-neutral-600 hover:text-brand-500 transition-colors text-sm"
                  >−</button>
                  <span className="px-3 py-1 font-body text-sm font-medium">{item.quantity}</span>
                  <button
                    onClick={() => dispatch({ type: 'UPDATE_QTY', payload: { productId: item.productId, quantity: item.quantity + 1 } })}
                    className="px-2 py-1 text-neutral-600 hover:text-brand-500 transition-colors text-sm"
                  >+</button>
                </div>

                <p className="font-body font-semibold text-sm text-neutral-900">
                  {formatPrice(item.price * item.quantity)}
                </p>
              </div>
            </div>
          ))}

          <button
            onClick={() => dispatch({ type: 'CLEAR' })}
            className="text-sm text-neutral-400 hover:text-red-400 transition-colors font-body"
          >
            {t('Vider le panier', 'Clear cart')}
          </button>
        </div>

        {/* Summary */}
        <div>
          <div className="card p-6 sticky top-20">
            <h2 className="font-body font-semibold text-neutral-900 text-lg mb-5">
              {t('Récapitulatif', 'Order summary')}
            </h2>

            <div className="space-y-3 text-sm font-body">
              <div className="flex justify-between text-neutral-600">
                <span>{t('Sous-total', 'Subtotal')}</span>
                <span>{formatPrice(state.subtotal)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>TPS (5%)</span>
                <span>{formatPrice(taxes.gst)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>TVQ (9.975%)</span>
                <span>{formatPrice(taxes.pst)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>{t('Livraison', 'Shipping')}</span>
                <span>{shipping === 0 ? t('Gratuite', 'Free') : formatPrice(shipping)}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-neutral-400">
                  {t(`Livraison gratuite dès ${formatPrice(75)}`, `Free shipping over ${formatPrice(75)}`)}
                </p>
              )}
              <div className="border-t border-neutral-100 pt-3 flex justify-between font-semibold text-neutral-900">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>

            <Link href="/shop/checkout" className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
              {t('Procéder au paiement', 'Proceed to checkout')}
              <ArrowRight size={16} />
            </Link>

            <Link href="/shop/products" className="btn-ghost w-full mt-2 text-center block text-sm">
              {t('Continuer mes achats', 'Continue shopping')}
            </Link>

            <p className="text-xs text-neutral-400 font-body text-center mt-4">
              {t('Paiement sécurisé SSL · PCI DSS conforme', 'SSL secured · PCI DSS compliant')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
