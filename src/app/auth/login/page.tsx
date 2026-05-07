'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

type LoginForm = { email: string; password: string }

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit } = useForm<LoginForm>()

  async function onSubmit(data: LoginForm) {
    setLoading(true)
    const res = await signIn('credentials', { ...data, redirect: false })
    if (res?.ok) {
      toast.success('Connexion réussie')
      router.push('/')
    } else {
      toast.error('Email ou mot de passe incorrect')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl font-bold text-neutral-900">
            Cosmo<span className="text-brand-500">Chain</span>
          </Link>
          <h1 className="font-body text-xl font-semibold text-neutral-700 mt-3">Connexion</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-8 space-y-4">
          <input
            {...register('email', { required: true })}
            type="email"
            placeholder="Adresse email"
            className="input-field"
            autoComplete="email"
          />
          <input
            {...register('password', { required: true })}
            type="password"
            placeholder="Mot de passe"
            className="input-field"
            autoComplete="current-password"
          />
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-center text-sm font-body text-neutral-500 mt-6">
          Pas encore de compte ?{' '}
          <Link href="/auth/register" className="text-brand-500 hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
