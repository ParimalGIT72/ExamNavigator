import mongoose, { Schema, Document } from 'mongoose';

export interface ICitation {
  resourceId?: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId;
  chunkText: string;
  score: number;
}

export interface IChatMessageDocument extends Document {
  _id: mongoose.Types.ObjectId;
  sessionId: mongoose.Types.ObjectId;
  sender: 'User' | 'Assistant' | 'System';
  content: string;
  citations?: ICitation[];
  tokenCount?: number;
  feedback?: 'ThumbsUp' | 'ThumbsDown' | 'None';
  /** True when this message has been consumed into a conversationSummary */
  isIncludedInSummary: boolean;
  /** True when RAG context was injected to generate this assistant message */
  ragContextUsed: boolean;
  /** AI response latency in milliseconds — maps to AIResponseTime in DATABASE_SCHEMA.md §28 */
  latencyMs?: number;
  createdAt: Date;
  updatedAt: Date;
}

const CitationSchema = new Schema<ICitation>({
  resourceId: { type: Schema.Types.ObjectId, ref: 'LearningResource' },
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic' },
  chunkText: { type: String, required: true },
  score: { type: Number, default: 0 },
});

const ChatMessageSchema = new Schema<IChatMessageDocument>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: 'ChatSession', required: true, index: true },
    sender: { type: String, enum: ['User', 'Assistant', 'System'], required: true },
    content: { type: String, required: true },
    citations: [CitationSchema],
    tokenCount: { type: Number, default: 0 },
    feedback: { type: String, enum: ['ThumbsUp', 'ThumbsDown', 'None'], default: 'None' },
    isIncludedInSummary: { type: Boolean, default: false, index: true },
    ragContextUsed: { type: Boolean, default: false },
    latencyMs: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

ChatMessageSchema.index({ sessionId: 1, createdAt: 1 });
ChatMessageSchema.index({ sessionId: 1, isIncludedInSummary: 1, createdAt: 1 });

export const ChatMessageModel = mongoose.model<IChatMessageDocument>('ChatMessage', ChatMessageSchema, 'chatMessages');
