import mongoose, { Schema, Document } from 'mongoose';

export interface ILearningResourceDocument extends Document {
  _id: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  title: string;
  resourceType: 'PDF' | 'Video' | 'Text' | 'Link' | 'FormulaSheet';
  contentUrl?: string;
  textContent?: string;
  author?: string;
  fileSize?: number;
  mimeType?: string;
  metadata?: Record<string, unknown>;
  processingStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  chunkCount?: number;
  processingError?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LearningResourceSchema = new Schema<ILearningResourceDocument>(
  {
    topicId: {
      type: Schema.Types.ObjectId,
      ref: 'Topic',
      required: true,
    },
    chapterId: {
      type: Schema.Types.ObjectId,
      ref: 'Chapter',
      required: true,
      index: true,
    },
    subjectId: {
      type: Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    resourceType: {
      type: String,
      enum: ['PDF', 'Video', 'Text', 'Link', 'FormulaSheet'],
      required: true,
    },
    contentUrl: {
      type: String,
      default: '',
    },
    textContent: {
      type: String,
      default: '',
    },
    author: {
      type: String,
      default: '',
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    mimeType: {
      type: String,
      default: '',
    },
    metadata: {
      type: Map,
      of: Schema.Types.Mixed,
      default: {},
    },
    processingStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'COMPLETED',
    },
    chunkCount: {
      type: Number,
      default: 0,
    },
    processingError: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

LearningResourceSchema.index({ topicId: 1 });
LearningResourceSchema.index({ resourceType: 1 });

export const LearningResourceModel = mongoose.model<ILearningResourceDocument>(
  'LearningResource',
  LearningResourceSchema,
  'learningResources'
);
