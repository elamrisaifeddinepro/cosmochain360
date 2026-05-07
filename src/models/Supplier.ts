import mongoose, { Schema, Document } from 'mongoose'

export interface ISupplier extends Document {
  code: string
  name: string
  contact: {
    name: string
    email: string
    phone: string
  }
  address: {
    street: string
    city: string
    country: string
  }
  // KPIs supply chain
  otd: number           // On-Time Delivery %
  qualityScore: number  // 0-100
  incidents: number     // last 12 months
  priceVariance: number // %
  riskScore: number     // computed
  riskGrade: 'A' | 'B' | 'C'
  // SAP MM fields
  sapVendorCode?: string
  paymentTerms: string
  currency: string
  leadTimeDays: number
  isActive: boolean
  lastReviewDate?: Date
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const SupplierSchema = new Schema<ISupplier>(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    contact: {
      name: String,
      email: String,
      phone: String,
    },
    address: {
      street: String,
      city: String,
      country: String,
    },
    otd: { type: Number, default: 100, min: 0, max: 100 },
    qualityScore: { type: Number, default: 100, min: 0, max: 100 },
    incidents: { type: Number, default: 0, min: 0 },
    priceVariance: { type: Number, default: 0 },
    riskScore: { type: Number, default: 100 },
    riskGrade: { type: String, enum: ['A', 'B', 'C'], default: 'A' },
    sapVendorCode: String,
    paymentTerms: { type: String, default: 'Net30' },
    currency: { type: String, default: 'CAD' },
    leadTimeDays: { type: Number, default: 14 },
    isActive: { type: Boolean, default: true },
    lastReviewDate: Date,
    notes: String,
  },
  { timestamps: true }
)

export default mongoose.models.Supplier || mongoose.model<ISupplier>('Supplier', SupplierSchema)
