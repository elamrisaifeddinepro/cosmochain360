import { NextRequest } from 'next/server'
import AuditLog from '@/models/AuditLog'

type LogAuditParams = {
  userId?: string | null
  userEmail?: string | null
  action: string
  entity: string
  entityId?: string | null
  metadata?: Record<string, any>
  ipAddress?: string | null
  userAgent?: string | null
}

export async function logAudit({
  userId = null,
  userEmail = null,
  action,
  entity,
  entityId = null,
  metadata = {},
  ipAddress = null,
  userAgent = null,
}: LogAuditParams) {
  try {
    await AuditLog.create({
      userId,
      userEmail,
      action,
      entity,
      entityId,
      metadata,
      ipAddress,
      userAgent,
    })
  } catch (error) {
    console.error('Audit log error:', error)
  }
}

export function getRequestInfo(req: NextRequest) {
  const forwardedFor = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')

  const ipAddress =
    forwardedFor?.split(',')[0]?.trim() ||
    realIp ||
    null

  const userAgent = req.headers.get('user-agent') || null

  return {
    ipAddress,
    userAgent,
  }
}