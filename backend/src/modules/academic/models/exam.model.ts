import mongoose, { Schema, Document } from 'mongoose';

export interface IExamDocument extends Document {
  _id: mongoose.Types.ObjectId;
  code: string;
  name: string;
  category: 'Engineering' | 'Medical' | 'Management' | 'General';
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema<IExamDocument>(
  {
    code: {
      type: String,
      required: [true, 'Exam code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Exam name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Exam category is required'],
      enum: ['Engineering', 'Medical', 'Management', 'General'],
      default: 'Engineering',
    },
    description: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
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

ExamSchema.index({ category: 1, order: 1 });
ExamSchema.index({ isActive: 1 });

export const ExamModel = mongoose.model<IExamDocument>('Exam', ExamSchema, 'exams');
