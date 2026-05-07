import mongoose, { Schema, Document } from 'mongoose'

export interface IForecast extends Document {
  productId: mongoose.Types.ObjectId
  site: string
  week: string
  forecastedDemand: number
  actualDemand?: number
  mape?: number
  modelName: string
  generatedAt: Date
  createdAt: Date
}

const ForecastSchema = new Schema<IForecast>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    site: { type: String, required: true },
    week: { type: String, required: true },
    forecastedDemand: { type: Number, required: true },
    actualDemand: Number,
    mape: Number,
    modelName: { type: String, default: 'moving_average_12w' },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
)

ForecastSchema.index({ productId: 1, site: 1, week: 1 }, { unique: true })

export default mongoose.models.Forecast ||
  mongoose.model<IForecast>('Forecast', ForecastSchema)