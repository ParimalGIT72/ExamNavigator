import mongoose, { Schema, Document } from 'mongoose';

export interface IEmbeddingDocument extends Document {
  _id: mongoose.Types.ObjectId;
  resourceId: mongoose.Types.ObjectId;
  chunkIndex: number;
  chunkText: string;
  vector: number[];
  modelName: string;
  dimensions: number;
  tokenLength?: number;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const EmbeddingSchema = new Schema<IEmbeddingDocument>(
  {
    resourceId: { type: Schema.Types.ObjectId, ref: 'LearningResource', required: true, index: true },
    chunkIndex: { type: Number, required: true },
    chunkText: { type: String, required: true },
    vector: [{ type: Number, required: true }],
    modelName: { type: String, required: true, default: 'text-embedding-004' },
    dimensions: { type: Number, required: true, default: 768 },
    tokenLength: { type: Number, default: 0 },
    metadata: { type: Map, of: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

EmbeddingSchema.index({ resourceId: 1, chunkIndex: 1 }, { unique: true });

export const EmbeddingModel = mongoose.model<IEmbeddingDocument>('Embedding', EmbeddingSchema, 'embeddings');
