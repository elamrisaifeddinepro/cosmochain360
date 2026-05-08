import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import { z } from 'zod'
import { getRequestInfo, logAudit } from '@/lib/audit'

export const dynamic = 'force-dynamic'

const registerSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(1, 'Le prénom est obligatoire').trim(),
  lastName: z.string().min(1, 'Le nom est obligatoire').trim(),
  marketingConsent: z.boolean().default(false),
  analyticsConsent: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  try {
    await dbConnect()

    const body = await req.json()

    const result = registerSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.flatten() },
        { status: 400 }
      )
    }

    const {
      email,
      password,
      firstName,
      lastName,
      marketingConsent,
      analyticsConsent,
    } = result.data

    const existing = await User.findOne({ email })

    if (existing) {
      return NextResponse.json(
        { error: 'Cet email est déjà utilisé' },
        { status: 409 }
      )
    }

    const hasConsent = marketingConsent || analyticsConsent

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      marketingConsent,
      analyticsConsent,
      consentDate: hasConsent ? new Date() : undefined,
      role: 'client',
    })

    const { ipAddress, userAgent } = getRequestInfo(req)

    await logAudit({
      userId: String(user._id),
      userEmail: user.email,
      action: 'USER_REGISTERED',
      entity: 'User',
      entityId: String(user._id),
      metadata: {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        marketingConsent: user.marketingConsent,
        analyticsConsent: user.analyticsConsent,
        consentDate: user.consentDate,
      },
      ipAddress,
      userAgent,
    })

    return NextResponse.json(
      {
        message: 'Compte créé avec succès',
        userId: user._id,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('POST /api/auth/register error:', error)

    return NextResponse.json(
      { error: 'Erreur serveur lors de la création du compte' },
      { status: 500 }
    )
  }
}