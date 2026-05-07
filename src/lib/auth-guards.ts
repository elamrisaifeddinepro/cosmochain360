import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'

export type AppRole = 'client' | 'admin' | 'manager'

export async function requireAuth() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      ),
    }
  }

  return {
    authorized: true as const,
    session,
  }
}

export async function requireAdmin() {
  const auth = await requireAuth()

  if (!auth.authorized) {
    return auth
  }

  if (auth.session.user.role !== 'admin') {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: 'Accès réservé aux administrateurs' },
        { status: 403 }
      ),
    }
  }

  return {
    authorized: true as const,
    session: auth.session,
  }
}

export async function requireManagerOrAdmin() {
  const auth = await requireAuth()

  if (!auth.authorized) {
    return auth
  }

  const allowedRoles: AppRole[] = ['admin', 'manager']

  if (!allowedRoles.includes(auth.session.user.role as AppRole)) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: 'Accès réservé aux administrateurs ou managers' },
        { status: 403 }
      ),
    }
  }

  return {
    authorized: true as const,
    session: auth.session,
  }
}