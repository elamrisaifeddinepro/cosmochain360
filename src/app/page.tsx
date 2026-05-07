import Link from 'next/link'
import { Header } from '@/components/shop/Header'
import { Footer } from '@/components/shop/Footer'
import { ArrowRight, Shield, Truck, Leaf, Award, Sparkles } from 'lucide-react'

const categories = [
  { slug: 'soin-visage', fr: 'Soin Visage', emoji: '✦' },
  { slug: 'soin-corps', fr: 'Soin Corps', emoji: '◈' },
  { slug: 'maquillage', fr: 'Maquillage', emoji: '◉' },
  { slug: 'soin-cheveux', fr: 'Soin Cheveux', emoji: '✿' },
  { slug: 'parfumerie', fr: 'Parfumerie', emoji: '◆' },
  { slug: 'solaire', fr: 'Solaire', emoji: '☀' },
]

const features = [
  { icon: Shield, fr: 'Conforme Santé Canada' },
  { icon: Truck, fr: 'Livraison gratuite dès 75 $' },
  { icon: Leaf, fr: 'Ingrédients INCI tracés' },
  { icon: Award, fr: 'Conforme Loi 25 Québec' },
]

export default function HomePage() {
  return (
    <>
      <Header />

      <main className="soft-bg">
        <section className="relative overflow-hidden">
          <div className="page-container grid min-h-[82vh] items-center gap-12 py-20 lg:grid-cols-2">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-pink-100 bg-white/70 px-4 py-2 text-sm font-medium text-brand-600 shadow-sm">
                <Sparkles size={16} />
                CosmoChain 360 — Beauté, conformité & intelligence
              </div>

              <h1 className="font-display text-5xl font-bold leading-tight text-neutral-950 md:text-7xl">
                La beauté premium,
                <span className="block bg-gradient-to-r from-brand-500 to-pink-400 bg-clip-text text-transparent">
                  maîtrisée de bout en bout.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-600">
                Une boutique cosmétique moderne connectée à une logique supply chain,
                conformité produit, stock intelligent et dashboard BI.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/shop/products" className="btn-primary">
                  Découvrir la boutique
                  <ArrowRight size={17} className="ml-2" />
                </Link>

                <Link href="/shop/products?featured=true" className="btn-outline">
                  Voir les coups de cœur
                </Link>
              </div>
            </div>

            <div className="relative">
              <div className="glass-panel rounded-[2.5rem] p-6">
                <div className="rounded-[2rem] bg-gradient-to-br from-pink-100 via-white to-orange-100 p-8">
                  <div className="mb-8 flex justify-between">
                    <span className="badge bg-white text-brand-600 shadow-sm">CNF Ready</span>
                    <span className="badge bg-white text-neutral-700 shadow-sm">BI + IA</span>
                  </div>

                  <div className="flex aspect-square items-center justify-center rounded-[2rem] bg-white/70 shadow-inner">
                    <div className="text-center">
                      <div className="text-7xl">✦</div>
                      <p className="mt-4 font-display text-3xl font-bold text-neutral-950">
                        CosmoChain
                      </p>
                      <p className="mt-2 text-sm text-neutral-500">
                        E-commerce cosmétique intelligent
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-6 -left-6 hidden rounded-3xl bg-white p-5 shadow-xl md:block">
                <p className="text-sm text-neutral-500">Stock critique</p>
                <p className="text-2xl font-bold text-neutral-950">12 alertes</p>
              </div>

              <div className="absolute -right-6 top-8 hidden rounded-3xl bg-white p-5 shadow-xl md:block">
                <p className="text-sm text-neutral-500">Conformité</p>
                <p className="text-2xl font-bold text-brand-500">98%</p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/80 bg-white/70 py-5 backdrop-blur">
          <div className="page-container grid grid-cols-2 gap-4 md:grid-cols-4">
            {features.map(({ icon: Icon, fr }) => (
              <div key={fr} className="flex items-center justify-center gap-2 text-sm font-medium text-neutral-700">
                <Icon size={17} className="text-brand-500" />
                <span>{fr}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="page-container py-20">
          <div className="mb-12 text-center">
            <h2 className="section-title">Nos catégories</h2>
            <p className="mx-auto mt-4 max-w-2xl text-neutral-500">
              Une expérience boutique élégante, enrichie par une logique métier sérieuse :
              stock, conformité, fournisseurs et prévision.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/shop/products?category=${cat.slug}`}
                className="group card p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-pink-200 hover:shadow-xl hover:shadow-pink-100"
              >
                <div className="mb-4 text-4xl text-brand-400 transition-transform duration-300 group-hover:scale-110">
                  {cat.emoji}
                </div>
                <h3 className="font-body text-sm font-semibold text-neutral-800 group-hover:text-brand-500">
                  {cat.fr}
                </h3>
              </Link>
            ))}
          </div>
        </section>

        <section className="page-container pb-20">
          <div className="glass-panel rounded-[2rem] p-8 text-center md:p-14">
            <h2 className="section-title mb-5">Conformité totale, confiance absolue</h2>
            <p className="mx-auto mb-8 max-w-3xl leading-relaxed text-neutral-600">
              Chaque produit peut être suivi par CNF, INCI, PAO, lot, expiration et fournisseur.
              CosmoChain 360 n’est pas seulement une boutique : c’est une plateforme e-commerce,
              BI et supply chain pour le secteur cosmétique.
            </p>
            <Link href="/legal/confidentialite" className="btn-outline">
              Notre engagement légal
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}