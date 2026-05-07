import mongoose, { Schema, Document } from 'mongoose'

export interface IOrderItem {
  productId: mongoose.Types.ObjectId
  variantId?: string
  nameFr: string
  nameEn: string
  sku: string
  price: number
  quantity: number
  image: string
}

export interface IOrder extends Document {
  orderNumber: string
  userId?: mongoose.Types.ObjectId
  guestEmail?: string
  status:
    | 'pending'
    | 'confirmed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded'
  items: IOrderItem[]
  shippingAddress: {
    firstName: string
    lastName: string
    street: string
    city: string
    province: string
    postalCode: string
    country: string
  }
  subtotal: number
  gst: number
  pst: number
  shippingCost: number
  discount: number
  total: number
  currency: string
  stripePaymentIntentId?: string
  stripeChargeId?: string
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed'
  trackingNumber?: string
  carrier?: string
  estimatedDelivery?: Date
  deliveredAt?: Date
  notes?: string
  contractSentAt?: Date
  createdAt: Date
  updatedAt: Date
}

const OrderItemSchema = new Schema<IOrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  variantId: String,
  nameFr: { type: String, required: true },
  nameEn: { type: String, required: true },
  sku: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  image: String,
})

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    guestEmail: String,
    status: {
      type: String,
      enum: [
        'pending',
        'confirmed',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ],
      default: 'pending',
    },
    items: [OrderItemSchema],
    shippingAddress: {
      firstName: String,
      lastName: String,
      street: String,
      city: String,
      province: String,
      postalCode: String,
      country: String,
    },
    subtotal: { type: Number, required: true, min: 0 },
    gst: { type: Number, default: 0 },
    pst: { type: Number, default: 0 },
    shippingCost: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'CAD' },
    stripePaymentIntentId: String,
    stripeChargeId: String,
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
    },
    trackingNumber: String,
    carrier: String,
    estimatedDelivery: Date,
    deliveredAt: Date,
    notes: String,
    contractSentAt: Date,
  },
  { timestamps: true }
)

OrderSchema.index({ userId: 1, createdAt: -1 })
OrderSchema.index({ status: 1 })
OrderSchema.index({ paymentStatus: 1 })
OrderSchema.index({ createdAt: -1 })

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema)