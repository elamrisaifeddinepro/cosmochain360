import mongoose, { Schema } from 'mongoose'

const AuditLogSchema = new Schema(
  {
    userId: {
      type: String,
      default: null,
      index: true,
    },

    userEmail: {
      type: String,
      default: null,
      index: true,
    },

    action: {
      type: String,
      required: true,
      index: true,
    },

    entity: {
      type: String,
      required: true,
      index: true,
    },

    entityId: {
      type: String,
      default: null,
      index: true,
    },

    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },

    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
)

AuditLogSchema.index({ createdAt: -1 })
AuditLogSchema.index({ entity: 1, entityId: 1 })
AuditLogSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.models.AuditLog ||
  mongoose.model('AuditLog', AuditLogSchema)