import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestionOption {
  optionId: string;
  optionText: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface IQuestionBankDocument extends Document {
  _id: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  questionText: string;
  options: IQuestionOption[];
  correctOptionId?: string;
  explanation?: string;
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  questionType: 'SingleChoice' | 'MultipleChoice' | 'Numerical' | 'AssertionReason';
  examType: 'JEE' | 'NEET' | 'MHT-CET' | 'University' | 'Other';
  previousYearExam?: string;
  previousYear?: number;
  marks: number;
  negativeMarks: number;
  tags?: string[];
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionOptionSchema = new Schema<IQuestionOption>({
  optionId: { type: String, required: true },
  optionText: { type: String, required: true },
  isCorrect: { type: Boolean, required: true, default: false },
  explanation: { type: String, default: '' },
});

const QuestionBankSchema = new Schema<IQuestionBankDocument>(
  {
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true, index: true },
    chapterId: { type: Schema.Types.ObjectId, ref: 'Chapter', required: true, index: true },
    topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true, index: true },
    questionText: { type: String, required: [true, 'Question text is required'] },
    options: [QuestionOptionSchema],
    correctOptionId: { type: String, default: '' },
    explanation: { type: String, default: '' },
    difficultyLevel: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' },
    questionType: {
      type: String,
      enum: ['SingleChoice', 'MultipleChoice', 'Numerical', 'AssertionReason'],
      default: 'SingleChoice',
    },
    examType: { type: String, enum: ['JEE', 'NEET', 'MHT-CET', 'University', 'Other'], default: 'JEE' },
    previousYearExam: { type: String, default: '' },
    previousYear: { type: Number },
    marks: { type: Number, default: 4 },
    negativeMarks: { type: Number, default: 1 },
    tags: [{ type: String }],
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

QuestionBankSchema.index({ subjectId: 1, chapterId: 1, difficultyLevel: 1 });
QuestionBankSchema.index({ examType: 1, previousYear: 1 });

export const QuestionBankModel = mongoose.model<IQuestionBankDocument>(
  'QuestionBank',
  QuestionBankSchema,
  'questionBank'
);
