'use client'

import { Suspense, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import { useCart } from '@/context/CartContext'

function CheckoutSuccessContent() {
  const { dispatch } = useCart()
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')

  useEffect(() => {
    dispatch({ type: 'CLEAR' })
  }, [dispatch])

  return (
    <div className="page-container py-20 text-center max-w-lg mx-auto">
      <CheckCircle2 size={56} className="text-green-500 mx-auto mb-6" />

      <h1 className="font-display text-3xl font-bold text-neutral-900 mb-3">
        Merci pour votre commande !
      </h1>

      <p className="text-neutral-500 font-body leading-relaxed mb-4">
        Votre paiement a été confirmé. Vous recevrez un email de confirmation avec le détail
        et votre contrat de vente (PDF) dans les 15 jours conformément à la Loi sur la
        protection du consommateur (OPC Québec).
      </p>

      {orderId && (
        <p className="text-sm text-neutral-400 font-mono mb-8">
          Commande: {orderId}
        </p>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/shop/account" className="btn-outline">
          Suivre ma commande
        </Link>

        <Link href="/shop/products" className="btn-primary">
          Continuer mes achats
        </Link>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="page-container py-20 text-center">
          Chargement de la confirmation...
        </div>
      }
    >
      <CheckoutSuccessContent />
    </Suspense>
  )
}