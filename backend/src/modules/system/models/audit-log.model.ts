import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLogDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    action: { type: String, required: true },
    entity: { type: String, required: true },
    entityId: { type: String, default: '' },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    details: { type: Map, of: Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
  }
);

AuditLogSchema.index({ userId: 1, createdAt: -1 });
// TTL index to automatically purge logs older than 90 days (7,776,000 seconds)
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

export const AuditLogModel = mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema, 'auditLogs');
