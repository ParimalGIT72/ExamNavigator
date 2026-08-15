import mongoose, { Schema, Document } from 'mongoose';

export interface IAiLogDocument extends Document {
  userId: mongoose.Types.ObjectId;
  requestType: 'Chat_Direct' | 'Chat_Stream' | 'Chat_Session' | 'RAG_Query' | 'Notes_Generate' | 'Flashcards_Generate';
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  modelUsed: string;
  latencyMs: number;
  status: 'Success' | 'Quota_Exceeded' | 'Safety_Blocked' | 'Error';
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AiLogSchema = new Schema<IAiLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    requestType: {
      type: String,
      enum: ['Chat_Direct', 'Chat_Stream', 'Chat_Session', 'RAG_Query', 'Notes_Generate', 'Flashcards_Generate'],
      required: true,
    },
    promptTokens: { type: Number, default: 0 },
    completionTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    modelUsed: { type: String, default: 'gemini-2.5-pro' },
    latencyMs: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['Success', 'Quota_Exceeded', 'Safety_Blocked', 'Error'],
      default: 'Success',
    },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

AiLogSchema.index({ userId: 1, createdAt: -1 });

export const AiLogModel = mongoose.model<IAiLogDocument>('AiLog', AiLogSchema);
