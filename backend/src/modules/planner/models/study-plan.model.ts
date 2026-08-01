import mongoose, { Schema, Document } from 'mongoose';

export interface IStudyTask {
  topicId: mongoose.Types.ObjectId;
  taskType: 'Study' | 'Practice' | 'Revision' | 'MockTest';
  estimatedMinutes: number;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface IWeeklySchedule {
  weekNumber: number;
  tasks: IStudyTask[];
}

export interface IStudyPlanDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  targetExam: 'JEE' | 'NEET' | 'MHT-CET' | 'University' | 'Other';
  startDate: Date;
  targetEndDate: Date;
  dailyGoalMinutes: number;
  weeklySchedules: IWeeklySchedule[];
  progressPercentage: number;
  status: 'Active' | 'Completed' | 'Paused' | 'Expired';
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const StudyTaskSchema = new Schema<IStudyTask>({
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  taskType: {
    type: String,
    enum: ['Study', 'Practice', 'Revision', 'MockTest'],
    required: true,
    default: 'Study',
  },
  estimatedMinutes: { type: Number, default: 60 },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
});

const WeeklyScheduleSchema = new Schema<IWeeklySchedule>({
  weekNumber: { type: Number, required: true },
  tasks: [StudyTaskSchema],
});

const StudyPlanSchema = new Schema<IStudyPlanDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: [true, 'Plan title is required'], trim: true },
    targetExam: { type: String, enum: ['JEE', 'NEET', 'MHT-CET', 'University', 'Other'], default: 'JEE' },
    startDate: { type: Date, required: true, default: Date.now },
    targetEndDate: { type: Date, required: true },
    dailyGoalMinutes: { type: Number, default: 120 },
    weeklySchedules: [WeeklyScheduleSchema],
    progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Paused', 'Expired'],
      default: 'Active',
      index: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

StudyPlanSchema.index({ userId: 1, status: 1 });

export const StudyPlanModel = mongoose.model<IStudyPlanDocument>('StudyPlan', StudyPlanSchema, 'studyPlans');
