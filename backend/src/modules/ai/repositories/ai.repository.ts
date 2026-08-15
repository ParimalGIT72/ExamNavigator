import { Types } from 'mongoose';
import { ChatSessionModel, IChatSessionDocument } from '../models/chat-session.model';
import { ChatMessageModel, IChatMessageDocument } from '../models/chat-message.model';
import { EmbeddingModel, IEmbeddingDocument } from '../models/embedding.model';
import { AiNoteModel, IAiNoteDocument } from '../models/ai-note.model';
import { FlashcardModel, IFlashcardDocument } from '../models/flashcard.model';
import { AiLogModel, IAiLogDocument } from '../models/ai-log.model';

export class ChatSessionRepository {
  public async create(data: Partial<IChatSessionDocument>): Promise<IChatSessionDocument> {
    const session = new ChatSessionModel(data);
    return await session.save();
  }

  public async findById(id: string): Promise<IChatSessionDocument | null> {
    return await ChatSessionModel.findById(id).exec();
  }

  /** Ownership-safe lookup — returns null if session does not exist, belongs to another user, or fails status filter */
  public async findByIdAndUserId(
    id: string,
    userId: string,
    status?: 'Active' | 'Archived'
  ): Promise<IChatSessionDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) return null;
    const filter: any = { _id: id, userId };
    if (status) filter.status = status;
    return await ChatSessionModel.findOne(filter).exec();
  }

  public async findByUserId(userId: string): Promise<IChatSessionDocument[]> {
    return await ChatSessionModel.find({ userId, status: 'Active' }).sort({ lastMessageAt: -1 }).exec();
  }

  public async getPaginatedByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
    status?: 'Active' | 'Archived'
  ): Promise<{ sessions: IChatSessionDocument[]; total: number }> {
    const filter: any = { userId };
    if (status) filter.status = status;
    const skip = (page - 1) * limit;
    const [sessions, total] = await Promise.all([
      ChatSessionModel.find(filter).sort({ lastMessageAt: -1 }).skip(skip).limit(limit).exec(),
      ChatSessionModel.countDocuments(filter).exec(),
    ]);
    return { sessions, total };
  }

  public async update(
    id: string,
    data: Partial<Pick<IChatSessionDocument, 'title' | 'lastMessageAt' | 'messageCount' | 'conversationSummary' | 'summaryUpdatedAt' | 'currentTopic' | 'status'>>
  ): Promise<IChatSessionDocument | null> {
    return await ChatSessionModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  /**
   * Performs an optimistic conditional update for conversation summaries.
   * Matches _id and expectedSummaryUpdatedAt (or null/undefined case) to prevent stale summary overwrites.
   */
  public async updateSummary(
    sessionId: string,
    expectedSummaryUpdatedAt: Date | undefined | null,
    newSummary: string
  ): Promise<IChatSessionDocument | null> {
    if (!Types.ObjectId.isValid(sessionId)) return null;

    const filter: any = { _id: sessionId };
    if (expectedSummaryUpdatedAt) {
      filter.summaryUpdatedAt = expectedSummaryUpdatedAt;
    } else {
      filter.$or = [
        { summaryUpdatedAt: { $exists: false } },
        { summaryUpdatedAt: null },
      ];
    }

    return await ChatSessionModel.findOneAndUpdate(
      filter,
      {
        conversationSummary: newSummary,
        summaryUpdatedAt: new Date(),
      },
      { new: true }
    ).exec();
  }

  public async archiveSession(id: string, userId: string): Promise<IChatSessionDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) return null;
    return await ChatSessionModel.findOneAndUpdate(
      { _id: id, userId, status: 'Active' },
      { status: 'Archived' },
      { new: true }
    ).exec();
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

  /**
   * Fetches the most recent `limit` messages for the sliding context window.
   * Returns them in chronological order (oldest first) for prompt construction.
   */
  public async findWindowMessages(sessionId: string, limit: number = 10): Promise<IChatMessageDocument[]> {
    const messages = await ChatMessageModel
      .find({ sessionId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
    return messages.reverse(); // Return oldest-first for prompt construction
  }

  /** Fetches messages NOT yet included in a summary strictly older than the active context window */
  public async findOutsideWindowUnsummarized(
    sessionId: string,
    oldestIncludedDate: Date
  ): Promise<IChatMessageDocument[]> {
    return await ChatMessageModel.find({
      sessionId,
      isIncludedInSummary: false,
      createdAt: { $lt: oldestIncludedDate },
    })
      .sort({ createdAt: 1 })
      .exec();
  }

  /** Count messages NOT yet included in a summary strictly older than the active context window */
  public async countOutsideWindowUnsummarized(
    sessionId: string,
    oldestIncludedDate: Date
  ): Promise<number> {
    return await ChatMessageModel.countDocuments({
      sessionId,
      isIncludedInSummary: false,
      createdAt: { $lt: oldestIncludedDate },
    }).exec();
  }

  /** Bulk-marks a set of messages as summarized */
  public async markAsSummarized(messageIds: string[]): Promise<void> {
    if (!messageIds.length) return;
    await ChatMessageModel.updateMany(
      { _id: { $in: messageIds } },
      { isIncludedInSummary: true }
    ).exec();
  }

  public async countBySessionId(sessionId: string): Promise<number> {
    return await ChatMessageModel.countDocuments({ sessionId }).exec();
  }
}

export class EmbeddingRepository {
  public async create(data: Partial<IEmbeddingDocument>): Promise<IEmbeddingDocument> {
    const embedding = new EmbeddingModel(data);
    return await embedding.save();
  }

  public async insertMany(data: Partial<IEmbeddingDocument>[]): Promise<IEmbeddingDocument[]> {
    if (!data || data.length === 0) return [];
    return (await EmbeddingModel.insertMany(data)) as unknown as IEmbeddingDocument[];
  }

  public async findByResourceId(resourceId: string): Promise<IEmbeddingDocument[]> {
    if (!Types.ObjectId.isValid(resourceId)) return [];
    return await EmbeddingModel.find({ resourceId }).sort({ chunkIndex: 1 }).exec();
  }

  public async deleteByResourceId(resourceId: string): Promise<number> {
    if (!Types.ObjectId.isValid(resourceId)) return 0;
    const result = await EmbeddingModel.deleteMany({ resourceId }).exec();
    return result.deletedCount || 0;
  }

  public async findCandidatesByMetadata(filters: {
    subjectId?: string;
    chapterId?: string;
    topicId?: string;
  }): Promise<IEmbeddingDocument[]> {
    const query: any = {};

    if (filters.subjectId && Types.ObjectId.isValid(filters.subjectId)) {
      query['metadata.subjectId'] = filters.subjectId;
    }
    if (filters.chapterId && Types.ObjectId.isValid(filters.chapterId)) {
      query['metadata.chapterId'] = filters.chapterId;
    }
    if (filters.topicId && Types.ObjectId.isValid(filters.topicId)) {
      query['metadata.topicId'] = filters.topicId;
    }

    return await EmbeddingModel.find(query).exec();
  }
}

export class AiNoteRepository {
  public async create(data: Partial<IAiNoteDocument>): Promise<IAiNoteDocument> {
    const note = new AiNoteModel(data);
    return await note.save();
  }

  /** Ownership-safe lookup for a single note */
  public async findByIdAndUserId(id: string, userId: string): Promise<IAiNoteDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) return null;
    return await AiNoteModel.findOne({ _id: id, userId, isDeleted: { $ne: true } }).exec();
  }

  public async findByUserId(userId: string): Promise<IAiNoteDocument[]> {
    return await AiNoteModel.find({ userId, isArchived: false, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).exec();
  }

  public async getPaginatedByUserId(
    userId: string,
    page: number = 1,
    limit: number = 20,
    topicId?: string
  ): Promise<{ notes: IAiNoteDocument[]; total: number }> {
    const filter: any = { userId, isDeleted: { $ne: true } };
    if (topicId && Types.ObjectId.isValid(topicId)) {
      filter.topicId = topicId;
    }
    const skip = (page - 1) * limit;
    const [notes, total] = await Promise.all([
      AiNoteModel.find(filter).sort({ isPinned: -1, createdAt: -1 }).skip(skip).limit(limit).exec(),
      AiNoteModel.countDocuments(filter).exec(),
    ]);
    return { notes, total };
  }

  public async updateNote(
    id: string,
    userId: string,
    data: Partial<Pick<IAiNoteDocument, 'title' | 'content' | 'summary' | 'keyTakeaways' | 'tags' | 'isPinned' | 'isArchived'>>
  ): Promise<IAiNoteDocument | null> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) return null;
    return await AiNoteModel.findOneAndUpdate(
      { _id: id, userId, isDeleted: { $ne: true } },
      data,
      { new: true }
    ).exec();
  }

  public async softDelete(id: string, userId?: string): Promise<IAiNoteDocument | null> {
    if (!Types.ObjectId.isValid(id)) return null;
    const filter: any = { _id: id };
    if (userId && Types.ObjectId.isValid(userId)) {
      filter.userId = userId;
    }
    return await AiNoteModel.findOneAndUpdate(
      filter,
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

  public async insertMany(data: Partial<IFlashcardDocument>[]): Promise<IFlashcardDocument[]> {
    if (!data || data.length === 0) return [];
    return (await FlashcardModel.insertMany(data)) as unknown as IFlashcardDocument[];
  }

  public async findByUserIdAndTopicId(
    userId: string,
    topicId?: string,
    page: number = 1,
    limit: number = 20
  ): Promise<{ flashcards: IFlashcardDocument[]; total: number }> {
    const filter: any = { userId };
    if (topicId && Types.ObjectId.isValid(topicId)) {
      filter.topicId = topicId;
    }
    const skip = (page - 1) * limit;
    const [flashcards, total] = await Promise.all([
      FlashcardModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      FlashcardModel.countDocuments(filter).exec(),
    ]);
    return { flashcards, total };
  }

  public async findDueForReview(userId: string, limit: number = 20): Promise<IFlashcardDocument[]> {
    if (!Types.ObjectId.isValid(userId)) return [];
    return await FlashcardModel.find({
      userId,
      nextReviewDate: { $lte: new Date() },
    })
      .sort({ nextReviewDate: 1 })
      .limit(limit)
      .exec();
  }

  public async deleteByIdAndUserId(id: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id) || !Types.ObjectId.isValid(userId)) return false;
    const res = await FlashcardModel.deleteOne({ _id: id, userId }).exec();
    return res.deletedCount > 0;
  }
}

export class AiLogRepository {
  public async create(data: Partial<IAiLogDocument>): Promise<IAiLogDocument> {
    const log = new AiLogModel(data);
    return await log.save();
  }

  public async getDailyTokenUsage(userId: string, date: Date = new Date()): Promise<number> {
    if (!Types.ObjectId.isValid(userId)) {
      return 0;
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const result = await AiLogModel.aggregate([
      {
        $match: {
          userId: new Types.ObjectId(userId),
          status: 'Success',
          createdAt: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          totalTokens: { $sum: '$totalTokens' },
        },
      },
    ]).exec();

    return result.length > 0 ? result[0].totalTokens : 0;
  }

  public async getDailyRequestCount(userId: string, date: Date = new Date()): Promise<number> {
    if (!Types.ObjectId.isValid(userId)) {
      return 0;
    }

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await AiLogModel.countDocuments({
      userId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    }).exec();
  }
}

export const chatSessionRepository = new ChatSessionRepository();
export const chatMessageRepository = new ChatMessageRepository();
export const embeddingRepository = new EmbeddingRepository();
export const aiNoteRepository = new AiNoteRepository();
export const flashcardRepository = new FlashcardRepository();
export const aiLogRepository = new AiLogRepository();
