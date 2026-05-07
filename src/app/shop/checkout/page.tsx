'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useLanguage } from '@/context/LanguageContext'
import { formatPrice, calculateTaxes } from '@/lib/utils'
import { useForm } from 'react-hook-form'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import toast from 'react-hot-toast'
import { Shield, Lock } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type CheckoutForm = {
  email: string
  firstName: string
  lastName: string
  street: string
  city: string
  province: string
  postalCode: string
  country: string
}

function PaymentForm({ clientSecret, orderId }: { clientSecret: string; orderId: string }) {
  const stripe = useStripe()
  const elements = useElements()
  const { dispatch } = useCart()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)

  async function handlePay() {
    if (!stripe || !elements) return
    setProcessing(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/shop/checkout/success?orderId=${orderId}`,
      },
    })

    if (error) {
      toast.error(error.message || 'Erreur de paiement')
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-4">
      <PaymentElement />
      <button
        onClick={handlePay}
        disabled={processing}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        <Lock size={16} />
        {processing ? 'Traitement...' : 'Payer maintenant'}
      </button>
    </div>
  )
}

export default function CheckoutPage() {
  const { state } = useCart()
  const { lang, t } = useLanguage()
  const [step, setStep] = useState<'info' | 'payment'>('info')
  const [clientSecret, setClientSecret] = useState('')
  const [orderId, setOrderId] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    defaultValues: { province: 'QC', country: 'CA' },
  })

  const shipping = state.subtotal >= 75 ? 0 : 9.99
  const taxes = calculateTaxes(state.subtotal, 'QC')
  const total = state.subtotal + taxes.gst + taxes.pst + shipping

  async function onSubmitInfo(data: CheckoutForm) {
    setLoading(true)
    try {
      // Create order
      const orderRes = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: state.items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            nameFr: i.nameFr,
            nameEn: i.nameEn,
            sku: i.sku,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
          shippingAddress: {
            firstName: data.firstName,
            lastName: data.lastName,
            street: data.street,
            city: data.city,
            province: data.province,
            postalCode: data.postalCode,
            country: data.country,
          },
          email: data.email,
          province: data.province,
        }),
      })
      const order = await orderRes.json()

      // Create payment intent
      const piRes = await fetch('/api/stripe/payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order._id }),
      })
      const { clientSecret: cs } = await piRes.json()

      setOrderId(order._id)
      setClientSecret(cs)
      setStep('payment')
    } catch {
      toast.error('Erreur lors de la création de la commande')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container py-10">
      <h1 className="section-title mb-8">{t('Paiement', 'Checkout')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {step === 'info' ? (
            <form onSubmit={handleSubmit(onSubmitInfo)} className="card p-6 space-y-4">
              <h2 className="font-body font-semibold text-neutral-900 text-lg">
                {t('Informations de livraison', 'Shipping information')}
              </h2>

              <input
                {...register('email', { required: true })}
                type="email"
                placeholder="Email *"
                className="input-field"
              />
              <div className="grid grid-cols-2 gap-4">
                <input {...register('firstName', { required: true })} placeholder={t('Prénom *', 'First name *')} className="input-field" />
                <input {...register('lastName', { required: true })} placeholder={t('Nom *', 'Last name *')} className="input-field" />
              </div>
              <input {...register('street', { required: true })} placeholder={t('Adresse *', 'Address *')} className="input-field" />
              <div className="grid grid-cols-2 gap-4">
                <input {...register('city', { required: true })} placeholder={t('Ville *', 'City *')} className="input-field" />
                <input {...register('postalCode', { required: true })} placeholder={t('Code postal *', 'Postal code *')} className="input-field" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select {...register('province')} className="input-field">
                  <option value="QC">Québec</option>
                  <option value="ON">Ontario</option>
                  <option value="BC">Colombie-Britannique</option>
                  <option value="AB">Alberta</option>
                  <option value="MB">Manitoba</option>
                  <option value="SK">Saskatchewan</option>
                  <option value="NS">Nouvelle-Écosse</option>
                  <option value="NB">Nouveau-Brunswick</option>
                  <option value="NL">Terre-Neuve</option>
                  <option value="PE">Île-du-Prince-Édouard</option>
                </select>
                <select {...register('country')} className="input-field">
                  <option value="CA">Canada</option>
                </select>
              </div>

              {/* OPC legal notice */}
              <div className="bg-blue-50 border border-blue-100 p-3 text-xs text-blue-700 font-body">
                <Shield size={12} className="inline mr-1" />
                {t(
                  'Conformément à la Loi sur la protection du consommateur (OPC Québec), un contrat PDF vous sera transmis dans les 15 jours suivant votre achat.',
                  'As per Quebec Consumer Protection Act (OPC), a PDF contract will be sent within 15 days of purchase.'
                )}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? 'Chargement...' : t('Continuer vers le paiement', 'Continue to payment')}
              </button>
            </form>
          ) : (
            <div className="card p-6">
              <h2 className="font-body font-semibold text-neutral-900 text-lg mb-4 flex items-center gap-2">
                <Lock size={18} className="text-brand-500" />
                {t('Paiement sécurisé', 'Secure payment')}
              </h2>
              <p className="text-xs text-neutral-400 font-body mb-4">
                {t('Chiffrement SSL · Tokenisation Stripe · PCI DSS', 'SSL · Stripe tokenization · PCI DSS compliant')}
              </p>

              {clientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{ clientSecret, locale: lang === 'fr' ? 'fr' : 'en' }}
                >
                  <PaymentForm clientSecret={clientSecret} orderId={orderId} />
                </Elements>
              )}
            </div>
          )}
        </div>

        {/* Summary */}
        <div>
          <div className="card p-5 sticky top-20">
            <h3 className="font-body font-semibold text-neutral-900 mb-4">
              {t('Votre commande', 'Your order')}
            </h3>
            <div className="space-y-3 text-sm font-body">
              {state.items.map((item) => (
                <div key={item.productId} className="flex justify-between text-neutral-600">
                  <span className="truncate mr-2">{lang === 'fr' ? item.nameFr : item.nameEn} ×{item.quantity}</span>
                  <span className="flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <hr className="border-neutral-100" />
              <div className="flex justify-between text-neutral-600"><span>TPS</span><span>{formatPrice(taxes.gst)}</span></div>
              <div className="flex justify-between text-neutral-600"><span>TVQ</span><span>{formatPrice(taxes.pst)}</span></div>
              <div className="flex justify-between text-neutral-600"><span>{t('Livraison', 'Shipping')}</span><span>{shipping === 0 ? '—' : formatPrice(shipping)}</span></div>
              <hr className="border-neutral-100" />
              <div className="flex justify-between font-semibold text-neutral-900 text-base">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
