import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import dbConnect from '@/lib/db'
import User from '@/models/User'

export async function PUT(req: NextRequest) {
  try {
    await dbConnect()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      )
    }

    const body = await req.json()

    const marketingConsent = Boolean(body.marketingConsent)
    const analyticsConsent = Boolean(body.analyticsConsent)

    const userId = (session.user as any).id

    const user = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          marketingConsent,
          analyticsConsent,
          consentDate: new Date(),
        },
      },
      {
        new: true,
      }
    ).select('-password')

    if (!user) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Consentements mis à jour avec succès',
      user,
    })
  } catch (error) {
    console.error('PUT /api/users/consent error:', error)

    return NextResponse.json(
      { error: 'Erreur serveur lors de la mise à jour des consentements' },
      { status: 500 }
    )
  }
}