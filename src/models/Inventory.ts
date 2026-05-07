import mongoose, { Schema, Document } from 'mongoose'

export interface IInventory extends Document {
  productId: mongoose.Types.ObjectId
  variantId?: string
  site: string
  quantity: number
  reserved: number  // Reserved for pending orders
  available: number // quantity - reserved
  lastUpdated: Date
  sapMaterialCode?: string
  createdAt: Date
  updatedAt: Date
}

const InventorySchema = new Schema<IInventory>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: String,
    site: { type: String, required: true, default: 'MTL-01' },
    quantity: { type: Number, default: 0, min: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    available: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now },
    sapMaterialCode: String,
  },
  { timestamps: true }
)

InventorySchema.index({ productId: 1, site: 1 }, { unique: true })

InventorySchema.pre('save', function (next) {
  this.available = Math.max(0, this.quantity - this.reserved)
  next()
})

export default mongoose.models.Inventory || mongoose.model<IInventory>('Inventory', InventorySchema)
