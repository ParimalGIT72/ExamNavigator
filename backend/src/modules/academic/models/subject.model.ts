import mongoose, { Schema, Document } from 'mongoose';

export interface ISubjectDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  examType: 'JEE' | 'NEET' | 'MHT-CET' | 'University' | 'Other';
  description?: string;
  icon?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubjectDocument>(
  {
    name: {
      type: String,
      required: [true, 'Subject name is required'],
      unique: true,
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Subject code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    examType: {
      type: String,
      enum: ['JEE', 'NEET', 'MHT-CET', 'University', 'Other'],
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

SubjectSchema.index({ examType: 1, isActive: 1 });

export const SubjectModel = mongoose.model<ISubjectDocument>('Subject', SubjectSchema, 'subjects');
