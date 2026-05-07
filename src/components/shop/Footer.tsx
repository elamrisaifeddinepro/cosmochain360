import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-20 bg-neutral-950 text-neutral-400">
      <div className="page-container py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <div className="mb-4 font-display text-3xl font-bold text-white">
              Cosmo<span className="text-brand-400">Chain</span>
              <span className="ml-1 text-xs font-body font-normal text-neutral-500">360</span>
            </div>

            <p className="max-w-sm text-sm leading-relaxed">
              Plateforme e-commerce cosmétique intelligente : boutique premium,
              conformité, stock, fournisseurs, BI et prévision IA.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              <span className="badge bg-white/10 text-neutral-300">Santé Canada</span>
              <span className="badge bg-white/10 text-neutral-300">Loi 25</span>
              <span className="badge bg-white/10 text-neutral-300">INCI</span>
            </div>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Boutique</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop/products?category=soin-visage" className="hover:text-brand-300">Soin Visage</Link></li>
              <li><Link href="/shop/products?category=soin-corps" className="hover:text-brand-300">Soin Corps</Link></li>
              <li><Link href="/shop/products?category=maquillage" className="hover:text-brand-300">Maquillage</Link></li>
              <li><Link href="/shop/products?category=soin-cheveux" className="hover:text-brand-300">Soin Cheveux</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Service client</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/legal/retours" className="hover:text-brand-300">Politique de retours</Link></li>
              <li><Link href="/legal/livraison" className="hover:text-brand-300">Livraison & délais</Link></li>
              <li><Link href="/shop/account" className="hover:text-brand-300">Mon compte</Link></li>
              <li><Link href="/contact" className="hover:text-brand-300">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white">Légal & conformité</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/legal/confidentialite" className="hover:text-brand-300">Confidentialité — Loi 25</Link></li>
              <li><Link href="/legal/conditions" className="hover:text-brand-300">Conditions de vente</Link></li>
              <li><Link href="/legal/cookies" className="hover:text-brand-300">Cookies & traceurs</Link></li>
              <li><Link href="/legal/accessibilite" className="hover:text-brand-300">Accessibilité WCAG 2.1</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs md:flex-row">
          <p>© {new Date().getFullYear()} CosmoChain 360 Inc. — Montréal, Québec, Canada</p>
          <p className="text-neutral-600">
            CNF · Loi 25 · OPC · CASL · PCI DSS
          </p>
        </div>
      </div>
    </footer>
  )
}