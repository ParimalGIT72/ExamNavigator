import mongoose, { Schema, Document } from 'mongoose';

export interface IMockTestQuestionItem {
  questionId: mongoose.Types.ObjectId;
  section: string;
  marks: number;
  negativeMarks: number;
  order: number;
}

export interface IMockTestDocument extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  examType: 'JEE' | 'NEET' | 'MHT-CET' | 'University' | 'Other';
  totalDurationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  questions: IMockTestQuestionItem[];
  isPublished: boolean;
  scheduledStartTime?: Date;
  scheduledEndTime?: Date;
  createdBy: mongoose.Types.ObjectId;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const MockTestQuestionItemSchema = new Schema<IMockTestQuestionItem>({
  questionId: { type: Schema.Types.ObjectId, ref: 'QuestionBank', required: true },
  section: { type: String, required: true, default: 'General' },
  marks: { type: Number, required: true, default: 4 },
  negativeMarks: { type: Number, required: true, default: 1 },
  order: { type: Number, required: true, default: 0 },
});

const MockTestSchema = new Schema<IMockTestDocument>(
  {
    title: { type: String, required: [true, 'Test title is required'], trim: true },
    description: { type: String, default: '' },
    examType: { type: String, enum: ['JEE', 'NEET', 'MHT-CET', 'University', 'Other'], required: true, default: 'JEE' },
    totalDurationMinutes: { type: Number, required: true, default: 180 },
    totalMarks: { type: Number, required: true, default: 300 },
    passingMarks: { type: Number, required: true, default: 120 },
    questions: [MockTestQuestionItemSchema],
    isPublished: { type: Boolean, default: false },
    scheduledStartTime: { type: Date },
    scheduledEndTime: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

MockTestSchema.index({ examType: 1, isPublished: 1 });
MockTestSchema.index({ scheduledStartTime: 1, scheduledEndTime: 1 });

export const MockTestModel = mongoose.model<IMockTestDocument>('MockTest', MockTestSchema, 'mockTests');
