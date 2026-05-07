import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/ui/Providers'
import { Toaster } from 'react-hot-toast'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'CosmoChain 360 — Cosmétiques Premium',
    template: '%s | CosmoChain 360',
  },
  description: 'Cosmétiques de qualité premium, conformes aux exigences Santé Canada et Loi 25 Québec.',
  keywords: ['cosmétiques', 'beauté', 'soin visage', 'INCI', 'Québec', 'Canada'],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable}`}>
      <body className="bg-neutral-50 text-neutral-900 font-body antialiased">
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'var(--font-dm-sans)',
                borderRadius: '4px',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}
