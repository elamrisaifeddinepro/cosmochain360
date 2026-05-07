import mongoose, { Schema, Document } from 'mongoose'

export interface IProduct extends Document {
  sku: string
  slug: string
  nameFr: string
  nameEn: string
  descriptionFr: string
  descriptionEn: string
  brand: string
  category: string
  subcategory?: string
  skinTypes: string[]
  inci: string
  warnings: string[]
  usageFr: string
  usageEn: string
  pao: string
  batchNumber?: string
  expiryDate?: Date
  importerFr: string
  importerEn: string
  images: string[]
  variants: IVariant[]
  price: number
  compareAtPrice?: number
  tags: string[]
  isActive: boolean
  isFeatured: boolean
  healthCanadaCnf?: string
  weight: number
  dimensions?: { l: number; w: number; h: number }
  supplierId?: mongoose.Types.ObjectId
  reorderPoint: number
  safetyStock: number
  leadTimeDays: number
  createdAt: Date
  updatedAt: Date
}

export interface IVariant {
  _id?: string
  name: string
  sku: string
  price?: number
  stock: number
  attributes: Record<string, string>
}

const VariantSchema = new Schema<IVariant>({
  name: { type: String, required: true },
  sku: { type: String, required: true },
  price: Number,
  stock: { type: Number, default: 0, min: 0 },
  attributes: { type: Map, of: String },
})

const ProductSchema = new Schema<IProduct>(
  {
    sku: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    nameFr: { type: String, required: true },
    nameEn: { type: String, required: true },
    descriptionFr: { type: String, required: true },
    descriptionEn: { type: String, required: true },
    brand: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: [
        'soin-visage',
        'soin-corps',
        'maquillage',
        'soin-cheveux',
        'parfumerie',
        'solaire',
      ],
    },
    subcategory: String,
    skinTypes: [
      {
        type: String,
        enum: ['normal', 'sec', 'gras', 'mixte', 'sensible', 'tous'],
      },
    ],
    inci: { type: String, required: true },
    warnings: [String],
    usageFr: { type: String, required: true },
    usageEn: { type: String, required: true },
    pao: { type: String, required: true },
    batchNumber: String,
    expiryDate: Date,
    importerFr: { type: String, required: true },
    importerEn: { type: String, required: true },
    images: [String],
    variants: [VariantSchema],
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: Number,
    tags: [String],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    healthCanadaCnf: String,
    weight: { type: Number, required: true },
    dimensions: { l: Number, w: Number, h: Number },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Supplier' },
    reorderPoint: { type: Number, default: 10 },
    safetyStock: { type: Number, default: 5 },
    leadTimeDays: { type: Number, default: 14 },
  },
  { timestamps: true }
)

ProductSchema.index({
  nameFr: 'text',
  nameEn: 'text',
  inci: 'text',
  tags: 'text',
})

ProductSchema.index({ category: 1, isActive: 1 })

export default mongoose.models.Product ||
  mongoose.model<IProduct>('Product', ProductSchema)