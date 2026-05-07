'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Package, ShoppingCart, Users,
  BarChart3, Truck, TrendingUp, Settings, LogOut
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/admin', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Produits', icon: Package },
  { href: '/admin/orders', label: 'Commandes', icon: ShoppingCart },
  { href: '/admin/inventory', label: 'Inventaire', icon: Truck },
  { href: '/admin/suppliers', label: 'Fournisseurs', icon: Users },
  { href: '/admin/analytics', label: 'Analytique BI', icon: BarChart3 },
  { href: '/admin/forecast', label: 'Prévisions IA', icon: TrendingUp },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex min-h-screen bg-neutral-100">
      {/* Sidebar */}
      <aside className="w-60 bg-neutral-950 text-white flex flex-col fixed inset-y-0 left-0 z-40">
        <div className="p-5 border-b border-neutral-800">
          <Link href="/" className="font-display text-xl font-bold">
            Cosmo<span className="text-brand-400">Chain</span>
            <span className="text-xs font-body font-normal text-neutral-500 ml-1 block">Admin 360</span>
          </Link>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-body transition-colors',
                  active
                    ? 'bg-brand-500 text-white'
                    : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                )}
              >
                <Icon size={17} />
                {label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-neutral-800 space-y-0.5">
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-body text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
          >
            <Settings size={17} />
            Paramètres
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 px-3 py-2.5 rounded text-sm font-body text-neutral-400 hover:bg-red-900 hover:text-white transition-colors w-full"
          >
            <LogOut size={17} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 p-6 min-h-screen">{children}</main>
    </div>
  )
}
