import mongoose, { Schema, Document } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  email: string
  password: string
  firstName: string
  lastName: string
  role: 'client' | 'admin' | 'manager'
  phone?: string
  addresses: IAddress[]
  marketingConsent: boolean
  analyticsConsent: boolean
  consentDate?: Date
  createdAt: Date
  updatedAt: Date
  comparePassword(password: string): Promise<boolean>
}

export interface IAddress {
  _id?: string
  label: string
  firstName: string
  lastName: string
  street: string
  city: string
  province: string
  postalCode: string
  country: string
  isDefault: boolean
}

const AddressSchema = new Schema<IAddress>({
  label: { type: String, default: 'Domicile' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  province: { type: String, required: true, default: 'QC' },
  postalCode: { type: String, required: true },
  country: { type: String, required: true, default: 'CA' },
  isDefault: { type: Boolean, default: false },
})

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    role: {
      type: String,
      enum: ['client', 'admin', 'manager'],
      default: 'client',
    },
    phone: String,
    addresses: [AddressSchema],
    marketingConsent: { type: Boolean, default: false },
    analyticsConsent: { type: Boolean, default: false },
    consentDate: Date,
  },
  { timestamps: true }
)

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

UserSchema.methods.comparePassword = async function (password: string) {
  return bcrypt.compare(password, this.password)
}

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
