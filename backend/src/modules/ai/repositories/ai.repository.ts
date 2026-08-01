import { ChatSessionModel, IChatSessionDocument } from '../models/chat-session.model';
import { ChatMessageModel, IChatMessageDocument } from '../models/chat-message.model';
import { EmbeddingModel, IEmbeddingDocument } from '../models/embedding.model';
import { AiNoteModel, IAiNoteDocument } from '../models/ai-note.model';
import { FlashcardModel, IFlashcardDocument } from '../models/flashcard.model';

export class ChatSessionRepository {
  public async create(data: Partial<IChatSessionDocument>): Promise<IChatSessionDocument> {
    const session = new ChatSessionModel(data);
    return await session.save();
  }

  public async findById(id: string): Promise<IChatSessionDocument | null> {
    return await ChatSessionModel.findById(id).exec();
  }

  public async findByUserId(userId: string): Promise<IChatSessionDocument[]> {
    return await ChatSessionModel.find({ userId, status: 'Active' }).sort({ lastMessageAt: -1 }).exec();
  }
}

export class ChatMessageRepository {
  public async create(data: Partial<IChatMessageDocument>): Promise<IChatMessageDocument> {
    const message = new ChatMessageModel(data);
    return await message.save();
  }

  public async findBySessionId(sessionId: string): Promise<IChatMessageDocument[]> {
    return await ChatMessageModel.find({ sessionId }).sort({ createdAt: 1 }).exec();
  }
}

export class EmbeddingRepository {
  public async create(data: Partial<IEmbeddingDocument>): Promise<IEmbeddingDocument> {
    const embedding = new EmbeddingModel(data);
    return await embedding.save();
  }

  public async findByResourceId(resourceId: string): Promise<IEmbeddingDocument[]> {
    return await EmbeddingModel.find({ resourceId }).sort({ chunkIndex: 1 }).exec();
  }
}

export class AiNoteRepository {
  public async create(data: Partial<IAiNoteDocument>): Promise<IAiNoteDocument> {
    const note = new AiNoteModel(data);
    return await note.save();
  }

  public async findByUserId(userId: string): Promise<IAiNoteDocument[]> {
    return await AiNoteModel.find({ userId, isArchived: false, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).exec();
  }

  public async softDelete(id: string): Promise<IAiNoteDocument | null> {
    return await AiNoteModel.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    ).exec();
  }
}

export class FlashcardRepository {
  public async create(data: Partial<IFlashcardDocument>): Promise<IFlashcardDocument> {
    const card = new FlashcardModel(data);
    return await card.save();
  }

  public async findDueForReview(userId: string): Promise<IFlashcardDocument[]> {
    return await FlashcardModel.find({ userId, nextReviewDate: { $lte: new Date() } }).exec();
  }
}

export const chatSessionRepository = new ChatSessionRepository();
export const chatMessageRepository = new ChatMessageRepository();
export const embeddingRepository = new EmbeddingRepository();
export const aiNoteRepository = new AiNoteRepository();
export const flashcardRepository = new FlashcardRepository();
