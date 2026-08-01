import mongoose, { Schema, Document } from 'mongoose';

export interface ITestQuestionResponse {
  questionId: mongoose.Types.ObjectId;
  selectedOptionId?: string;
  numericalAnswer?: number;
  isCorrect: boolean;
  marksObtained: number;
  timeSpentSeconds: number;
  status: 'Answered' | 'Unanswered' | 'Marked_For_Review' | 'Answered_And_Marked_For_Review';
}

export interface ITestAttemptDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  mockTestId: mongoose.Types.ObjectId;
  status: 'In_Progress' | 'Submitted' | 'Timed_Out' | 'Abandoned';
  startTime: Date;
  endTime?: Date;
  durationSpentSeconds: number;
  responses: ITestQuestionResponse[];
  score: number;
  totalCorrect: number;
  totalIncorrect: number;
  totalUnanswered: number;
  accuracyPercentage: number;
  percentile?: number;
  rank?: number;
  analysis?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const TestQuestionResponseSchema = new Schema<ITestQuestionResponse>({
  questionId: { type: Schema.Types.ObjectId, ref: 'QuestionBank', required: true },
  selectedOptionId: { type: String, default: '' },
  numericalAnswer: { type: Number },
  isCorrect: { type: Boolean, default: false },
  marksObtained: { type: Number, default: 0 },
  timeSpentSeconds: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['Answered', 'Unanswered', 'Marked_For_Review', 'Answered_And_Marked_For_Review'],
    default: 'Unanswered',
  },
});

const TestAttemptSchema = new Schema<ITestAttemptDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mockTestId: { type: Schema.Types.ObjectId, ref: 'MockTest', required: true, index: true },
    status: {
      type: String,
      enum: ['In_Progress', 'Submitted', 'Timed_Out', 'Abandoned'],
      default: 'In_Progress',
      index: true,
    },
    startTime: { type: Date, required: true, default: Date.now },
    endTime: { type: Date },
    durationSpentSeconds: { type: Number, default: 0 },
    responses: [TestQuestionResponseSchema],
    score: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalIncorrect: { type: Number, default: 0 },
    totalUnanswered: { type: Number, default: 0 },
    accuracyPercentage: { type: Number, default: 0 },
    percentile: { type: Number },
    rank: { type: Number },
    analysis: { type: Map, of: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

TestAttemptSchema.index({ userId: 1, mockTestId: 1 });

export const TestAttemptModel = mongoose.model<ITestAttemptDocument>('TestAttempt', TestAttemptSchema, 'testAttempts');
