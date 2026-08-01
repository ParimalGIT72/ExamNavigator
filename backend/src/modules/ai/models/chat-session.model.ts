import mongoose, { Schema, Document } from 'mongoose';

export interface IChatSessionDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  subjectId?: mongoose.Types.ObjectId;
  chapterId?: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId;
  status: 'Active' | 'Archived';
  messageCount: number;
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSessionSchema = new Schema<IChatSessionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, default: 'New Doubts Session', trim: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject' },
    chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter' },
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
    status: { type: String, enum: ['Active', 'Archived'], default: 'Active' },
    messageCount: { type: Number, default: 0 },
    lastMessageAt: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: true,
  }
);

ChatSessionSchema.index({ userId: 1, status: 1 });

export const ChatSessionModel = mongoose.model<IChatSessionDocument>('ChatSession', ChatSessionSchema, 'chatSessions');
