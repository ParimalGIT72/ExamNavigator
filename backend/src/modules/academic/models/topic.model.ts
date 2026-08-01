import mongoose, { Schema, Document } from 'mongoose';

export interface ITopicDocument extends Document {
  _id: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId;
  subjectId: mongoose.Types.ObjectId;
  title: string;
  topicNumber: number;
  summary?: string;
  difficultyLevel: 'Easy' | 'Medium' | 'Hard';
  importanceScore: number;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema = new Schema<ITopicDocument>(
  {
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
      required: [true, 'Topic title is required'],
      trim: true,
    },
    topicNumber: {
      type: Number,
      required: true,
    },
    summary: {
      type: String,
      default: '',
    },
    difficultyLevel: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    importanceScore: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },
    tags: [
      {
        type: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

TopicSchema.index({ chapterId: 1, topicNumber: 1 }, { unique: true });
TopicSchema.index({ title: 'text', summary: 'text', tags: 'text' });

export const TopicModel = mongoose.model<ITopicDocument>('Topic', TopicSchema, 'topics');
