import mongoose, { Schema, Document } from 'mongoose';

export type TopicProgressStatus = 'IN_PROGRESS' | 'COMPLETED';

export interface IUserTopicProgressDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  status: TopicProgressStatus;
  lastProgressUpdatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserTopicProgressSchema = new Schema<IUserTopicProgressDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'COMPLETED'],
      required: true,
    },
    lastProgressUpdatedAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: one progress document per user + topic
UserTopicProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

// Aggregate lookup index: efficient per-subject progress queries
UserTopicProgressSchema.index({ userId: 1, subjectId: 1 });

export const UserTopicProgressModel = mongoose.model<IUserTopicProgressDocument>(
  'UserTopicProgress',
  UserTopicProgressSchema,
  'user_topic_progress'
);
