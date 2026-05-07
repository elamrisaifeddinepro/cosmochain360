'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { ShoppingBag, User, Search, Menu, X, Globe, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'

const categories = [
  { slug: 'soin-visage', fr: 'Soin Visage', en: 'Face Care' },
  { slug: 'soin-corps', fr: 'Soin Corps', en: 'Body Care' },
  { slug: 'maquillage', fr: 'Maquillage', en: 'Makeup' },
  { slug: 'soin-cheveux', fr: 'Soin Cheveux', en: 'Hair Care' },
  { slug: 'parfumerie', fr: 'Parfumerie', en: 'Fragrance' },
  { slug: 'solaire', fr: 'Solaire', en: 'Sun Care' },
]

export function Header() {
  const { data: session } = useSession()
  const { state } = useCart()
  const { lang, setLang, t } = useLanguage()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQ, setSearchQ] = useState('')

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="bg-neutral-950 py-2 text-xs text-neutral-300">
        <div className="page-container flex items-center justify-between gap-4">
          <span className="inline-flex items-center gap-2">
            <Sparkles size={13} className="text-brand-300" />
            {t(
              'Livraison gratuite dès 75 $ | Conforme Santé Canada & Loi 25',
              'Free shipping over $75 | Health Canada & Law 25 compliant'
            )}
          </span>

          <button
            onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
            className="flex items-center gap-1 rounded-full px-2 py-1 transition-colors hover:bg-white/10 hover:text-white"
          >
            <Globe size={12} />
            {lang === 'fr' ? 'EN' : 'FR'}
          </button>
        </div>
      </div>

      <div className="page-container">
        <div className="flex h-20 items-center justify-between">
          <Link href="/" className="font-display text-2xl font-bold tracking-tight text-neutral-950">
            Cosmo<span className="text-brand-500">Chain</span>
            <span className="ml-1 text-xs font-body font-normal text-neutral-400">360</span>
          </Link>

          <nav className="hidden items-center gap-7 lg:flex">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop/products?category=${cat.slug}`}
                className="text-sm font-medium text-neutral-600 transition-colors hover:text-brand-500"
              >
                {lang === 'fr' ? cat.fr : cat.en}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="rounded-full p-2.5 text-neutral-600 transition-all hover:bg-pink-50 hover:text-brand-500"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {session ? (
              <div className="relative group">
                <button className="rounded-full p-2.5 text-neutral-600 transition-all hover:bg-pink-50 hover:text-brand-500">
                  <User size={20} />
                </button>

                <div className="invisible absolute right-0 top-full mt-3 w-48 translate-y-2 rounded-2xl border border-neutral-100 bg-white p-2 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  <Link href="/shop/account" className="block rounded-xl px-4 py-2.5 text-sm text-neutral-700 hover:bg-pink-50">
                    {t('Mon compte', 'My account')}
                  </Link>

                  {(session.user as any).role !== 'client' && (
                    <Link href="/admin" className="block rounded-xl px-4 py-2.5 text-sm text-neutral-700 hover:bg-pink-50">
                      Admin
                    </Link>
                  )}

                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="mt-1 block w-full rounded-xl border-t border-neutral-100 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    {t('Déconnexion', 'Sign out')}
                  </button>
                </div>
              </div>
            ) : (
              <Link href="/auth/login" className="rounded-full p-2.5 text-neutral-600 transition-all hover:bg-pink-50 hover:text-brand-500">
                <User size={20} />
              </Link>
            )}

            <Link href="/shop/cart" className="relative rounded-full p-2.5 text-neutral-600 transition-all hover:bg-pink-50 hover:text-brand-500">
              <ShoppingBag size={20} />
              {state.itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-xs font-semibold text-white">
                  {state.itemCount > 9 ? '9+' : state.itemCount}
                </span>
              )}
            </Link>

            <button
              className="rounded-full p-2.5 text-neutral-600 transition-all hover:bg-pink-50 lg:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="pb-4">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (searchQ.trim()) {
                  window.location.href = `/shop/products?q=${encodeURIComponent(searchQ.trim())}`
                }
              }}
            >
              <input
                type="search"
                autoFocus
                placeholder={t('Rechercher un produit, ingrédient...', 'Search products, ingredients...')}
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="input-field"
              />
            </form>
          </div>
        )}
      </div>

      {mobileOpen && (
        <div className="border-t border-neutral-100 bg-white/95 backdrop-blur lg:hidden">
          <nav className="page-container flex flex-col gap-1 py-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop/products?category=${cat.slug}`}
                className="rounded-xl px-3 py-3 text-sm font-medium text-neutral-700 hover:bg-pink-50"
                onClick={() => setMobileOpen(false)}
              >
                {lang === 'fr' ? cat.fr : cat.en}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}