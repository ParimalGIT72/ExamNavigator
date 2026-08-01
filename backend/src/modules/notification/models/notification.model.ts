import mongoose, { Schema, Document } from 'mongoose';

export interface INotificationDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'Study_Reminder' | 'Test_Result' | 'System_Update' | 'Achievement' | 'General';
  isRead: boolean;
  readAt?: Date;
  link?: string;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['Study_Reminder', 'Test_Result', 'System_Update', 'Achievement', 'General'],
      default: 'General',
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    link: { type: String, default: '' },
    expiresAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const NotificationModel = mongoose.model<INotificationDocument>(
  'Notification',
  NotificationSchema,
  'notifications'
);
