import { NextRequest, NextResponse } from 'next/server'
import dbConnect from '@/lib/db'
import User from '@/models/User'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  marketingConsent: z.boolean().default(false),
  analyticsConsent: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
  await dbConnect()
  const body = await req.json()

  const result = registerSchema.safeParse(body)
  if (!result.success) {
    return NextResponse.json({ error: result.error.flatten() }, { status: 400 })
  }

  const { email, password, firstName, lastName, marketingConsent, analyticsConsent } = result.data

  const existing = await User.findOne({ email })
  if (existing) {
    return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 })
  }

  const user = await User.create({
    email,
    password,
    firstName,
    lastName,
    marketingConsent,
    analyticsConsent,
    consentDate: new Date(),
    role: 'client',
  })

  return NextResponse.json(
    { message: 'Compte créé avec succès', userId: user._id },
    { status: 201 }
  )
}
