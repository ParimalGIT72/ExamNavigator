import mongoose, { Schema, Document } from 'mongoose';

export interface ISubjectPerformance {
  subjectId: mongoose.Types.ObjectId;
  totalQuestionsAttempted: number;
  correctCount: number;
  accuracy: number;
  averageTimePerQuestionSeconds: number;
  masteryLevel: 'Novice' | 'Intermediate' | 'Proficient' | 'Master';
}

export interface IAnalyticsDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  subjectPerformances: ISubjectPerformance[];
  strongTopics: mongoose.Types.ObjectId[];
  weakTopics: mongoose.Types.ObjectId[];
  totalTestsTaken: number;
  readinessScore: number;
  lastCalculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectPerformanceSchema = new Schema<ISubjectPerformance>({
  subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  totalQuestionsAttempted: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  averageTimePerQuestionSeconds: { type: Number, default: 0 },
  masteryLevel: {
    type: String,
    enum: ['Novice', 'Intermediate', 'Proficient', 'Master'],
    default: 'Novice',
  },
});

const AnalyticsSchema = new Schema<IAnalyticsDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    subjectPerformances: [SubjectPerformanceSchema],
    strongTopics: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
    weakTopics: [{ type: Schema.Types.ObjectId, ref: 'Topic' }],
    totalTestsTaken: { type: Number, default: 0 },
    readinessScore: { type: Number, default: 0, min: 0, max: 100 },
    lastCalculatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

export const AnalyticsModel = mongoose.model<IAnalyticsDocument>('Analytics', AnalyticsSchema, 'analytics');
