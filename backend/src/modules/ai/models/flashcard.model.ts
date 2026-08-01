import mongoose, { Schema, Document } from 'mongoose';

export interface IFlashcardDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  front: string;
  back: string;
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: Date;
  lastReviewedDate?: Date;
  masteryState: 'New' | 'Learning' | 'Review' | 'Mastered';
  createdAt: Date;
  updatedAt: Date;
}

const FlashcardSchema = new Schema<IFlashcardDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
    front: { type: String, required: true },
    back: { type: String, required: true },
    easeFactor: { type: Number, default: 2.5 },
    interval: { type: Number, default: 1 },
    repetitions: { type: Number, default: 0 },
    nextReviewDate: { type: Date, default: Date.now, index: true },
    lastReviewedDate: { type: Date },
    masteryState: {
      type: String,
      enum: ['New', 'Learning', 'Review', 'Mastered'],
      default: 'New',
    },
  },
  {
    timestamps: true,
  }
);

FlashcardSchema.index({ userId: 1, nextReviewDate: 1 });
FlashcardSchema.index({ userId: 1, topicId: 1 });

export const FlashcardModel = mongoose.model<IFlashcardDocument>('Flashcard', FlashcardSchema, 'flashcards');
