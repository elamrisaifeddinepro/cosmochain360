import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import { requireAuth } from '@/lib/auth-guards'
import { getRequestInfo, logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

export async function PUT(req: NextRequest) {
  const auth = await requireAuth()

  if (!auth.authorized) {
    return auth.response
  }

  try {
    await dbConnect()

    const body = await req.json()

    const marketingConsent = Boolean(body.marketingConsent)
    const analyticsConsent = Boolean(body.analyticsConsent)

    const userId = (auth.session.user as any).id
    const userEmail = (auth.session.user as any).email

    const previousUser = await User.findById(userId).select(
      'marketingConsent analyticsConsent consentDate'
    )

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

    const { ipAddress, userAgent } = getRequestInfo(req)

    await logAudit({
      userId,
      userEmail,
      action: 'CONSENT_UPDATED',
      entity: 'User',
      entityId: String(user._id),
      metadata: {
        before: {
          marketingConsent: previousUser?.marketingConsent ?? null,
          analyticsConsent: previousUser?.analyticsConsent ?? null,
          consentDate: previousUser?.consentDate ?? null,
        },
        after: {
          marketingConsent: user.marketingConsent,
          analyticsConsent: user.analyticsConsent,
          consentDate: user.consentDate,
        },
      },
      ipAddress,
      userAgent,
    })

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