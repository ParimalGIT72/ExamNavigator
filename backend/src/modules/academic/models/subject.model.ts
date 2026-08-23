import mongoose, { Schema, Document } from 'mongoose';

export interface ISubjectDocument extends Document {
  _id: mongoose.Types.ObjectId;
  examId?: mongoose.Types.ObjectId;
  name: string;
  code: string;
  examType: string;
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubjectDocument>(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      uppercase: true,
      trim: true,
    },
    examType: {
      type: String,
      required: true,
      default: 'JEE',
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

// Exam-scoped compound unique indexes
SubjectSchema.index({ examId: 1, code: 1 }, { unique: true, sparse: true });
SubjectSchema.index({ examId: 1, name: 1 }, { unique: true, sparse: true });
SubjectSchema.index({ code: 1, examType: 1 }, { unique: true, sparse: true });
SubjectSchema.index({ examType: 1, isActive: 1, order: 1 });
SubjectSchema.index({ examId: 1, isActive: 1, order: 1 });

export const SubjectModel = mongoose.model<ISubjectDocument>('Subject', SubjectSchema, 'subjects');
