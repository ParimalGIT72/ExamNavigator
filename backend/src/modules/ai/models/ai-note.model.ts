import mongoose, { Schema, Document } from 'mongoose';

export interface IAiNoteDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  title: string;
  content: string;
  summary?: string;
  keyTakeaways?: string[];
  tags?: string[];
  isPinned: boolean;
  isArchived: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AiNoteSchema = new Schema<IAiNoteDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    title: { type: String, required: [true, 'Note title is required'], trim: true },
    content: { type: String, required: true },
    summary: { type: String, default: '' },
    keyTakeaways: [{ type: String }],
    tags: [{ type: String }],
    isPinned: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

AiNoteSchema.index({ userId: 1, topicId: 1 });
AiNoteSchema.index({ title: 'text', content: 'text', tags: 'text' });

export const AiNoteModel = mongoose.model<IAiNoteDocument>('AiNote', AiNoteSchema, 'aiNotes');
