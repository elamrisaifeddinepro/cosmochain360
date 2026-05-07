import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number, currency = 'CAD', locale = 'fr-CA') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: Date | string, locale = 'fr-CA') {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date))
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function calculateTaxes(subtotal: number, province = 'QC') {
  const rates: Record<string, { gst: number; pst: number }> = {
    QC: { gst: 0.05, pst: 0.09975 },
    ON: { gst: 0, pst: 0.13 },
    BC: { gst: 0, pst: 0.12 },
    AB: { gst: 0.05, pst: 0 },
  }
  const rate = rates[province] || rates.QC
  const gst = subtotal * rate.gst
  const pst = subtotal * rate.pst
  return { gst, pst, total: gst + pst }
}

export function calculateROP(
  avgDailyDemand: number,
  leadTimeDays: number,
  safetyStock: number
) {
  return avgDailyDemand * leadTimeDays + safetyStock
}

export function calculateSafetyStock(
  zScore: number, // 1.65 for 95% service level
  stdDevDemand: number,
  leadTimeDays: number
) {
  return zScore * stdDevDemand * Math.sqrt(leadTimeDays)
}

export function calculateMAPE(actual: number[], forecast: number[]) {
  const n = actual.length
  let sum = 0
  for (let i = 0; i < n; i++) {
    if (actual[i] !== 0) {
      sum += Math.abs((actual[i] - forecast[i]) / actual[i])
    }
  }
  return (sum / n) * 100
}

export function supplierRiskScore(metrics: {
  otd: number        // On-Time Delivery %
  qualityScore: number // 0-100
  incidents: number  // last 12 months
  priceVariance: number // %
}): { score: number; grade: 'A' | 'B' | 'C' } {
  const score =
    metrics.otd * 0.4 +
    metrics.qualityScore * 0.35 +
    Math.max(0, 100 - metrics.incidents * 10) * 0.15 +
    Math.max(0, 100 - metrics.priceVariance * 2) * 0.1

  const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : 'C'
  return { score: Math.round(score), grade }
}

export function generateOrderNumber() {
  const date = new Date()
  const y = date.getFullYear().toString().slice(-2)
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const rand = Math.floor(Math.random() * 9000) + 1000
  return `CC${y}${m}${d}-${rand}`
}
