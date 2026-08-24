import mongoose, { Schema, Document } from 'mongoose';

export type ActivityEventType = 'TOPIC_STARTED' | 'TOPIC_COMPLETED' | 'TOPIC_RESUMED';

export interface ILearningActivityEventDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  eventType: ActivityEventType;
  occurredAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const LearningActivityEventSchema = new Schema<ILearningActivityEventDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
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
    eventType: {
      type: String,
      enum: ['TOPIC_STARTED', 'TOPIC_COMPLETED', 'TOPIC_RESUMED'],
      required: true,
    },
    occurredAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Query index for recent activity retrieval and timeline sorting per user
LearningActivityEventSchema.index({ userId: 1, occurredAt: -1 });

export const LearningActivityEventModel = mongoose.model<ILearningActivityEventDocument>(
  'LearningActivityEvent',
  LearningActivityEventSchema,
  'learning_activity_events'
);
