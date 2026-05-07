'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

type RegisterForm = {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  marketingConsent: boolean
  analyticsConsent: boolean
}

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>()

  async function onSubmit(data: RegisterForm) {
    if (data.password !== data.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    const json = await res.json()
    if (res.ok) {
      toast.success('Compte créé avec succès !')
      router.push('/auth/login')
    } else {
      toast.error(json.error || 'Erreur lors de la création du compte')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl font-bold text-neutral-900">
            Cosmo<span className="text-brand-500">Chain</span>
          </Link>
          <h1 className="font-body text-xl font-semibold text-neutral-700 mt-3">Créer un compte</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-8 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input {...register('firstName', { required: true })} placeholder="Prénom *" className="input-field" />
            <input {...register('lastName', { required: true })} placeholder="Nom *" className="input-field" />
          </div>
          <input
            {...register('email', { required: true })}
            type="email"
            placeholder="Email *"
            className="input-field"
          />
          <input
            {...register('password', { required: true, minLength: 8 })}
            type="password"
            placeholder="Mot de passe (min. 8 caractères) *"
            className="input-field"
          />
          <input
            {...register('confirmPassword', { required: true })}
            type="password"
            placeholder="Confirmer le mot de passe *"
            className="input-field"
          />

          {/* Loi 25 Consents */}
          <div className="bg-neutral-50 border border-neutral-200 p-4 space-y-3 text-sm font-body">
            <p className="text-neutral-600 font-medium">Consentements (Loi 25 Québec)</p>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('analyticsConsent')}
                className="mt-0.5 accent-brand-500"
              />
              <span className="text-neutral-600">
                J'accepte l'utilisation de mes données à des fins d'analyse de navigation
                (métriques anonymisées).
              </span>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                {...register('marketingConsent')}
                className="mt-0.5 accent-brand-500"
              />
              <span className="text-neutral-600">
                J'accepte de recevoir des communications marketing par email. Vous pouvez
                vous désabonner à tout moment (CASL/LCAP).
              </span>
            </label>
          </div>

          <p className="text-xs text-neutral-400 font-body">
            En créant un compte, vous acceptez nos{' '}
            <Link href="/legal/conditions" className="text-brand-500 hover:underline">Conditions de vente</Link>
            {' '}et notre{' '}
            <Link href="/legal/confidentialite" className="text-brand-500 hover:underline">Politique de confidentialité</Link>.
            La date et le type de consentement sont enregistrés conformément à la Loi 25.
          </p>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-sm font-body text-neutral-500 mt-6">
          Déjà un compte ?{' '}
          <Link href="/auth/login" className="text-brand-500 hover:underline">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
