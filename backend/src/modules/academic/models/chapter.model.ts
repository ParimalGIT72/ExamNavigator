import mongoose, { Schema, Document } from 'mongoose';

export interface IChapterDocument extends Document {
  _id: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  title: string;
  chapterNumber: number;
  description?: string;
  weightage?: number;
  estimatedHours?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChapterSchema = new Schema<IChapterDocument>(
  {
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Chapter title is required'],
      trim: true,
    },
    chapterNumber: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    weightage: {
      type: Number,
      default: 0,
    },
    estimatedHours: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

ChapterSchema.index({ subjectId: 1, chapterNumber: 1 }, { unique: true });
ChapterSchema.index({ subjectId: 1, isActive: 1 });

export const ChapterModel = mongoose.model<IChapterDocument>('Chapter', ChapterSchema, 'chapters');
