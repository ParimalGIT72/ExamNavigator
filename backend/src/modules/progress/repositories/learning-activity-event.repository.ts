import { ClientSession } from 'mongoose';
import {
  LearningActivityEventModel,
  ILearningActivityEventDocument,
  ActivityEventType,
} from '../models/learning-activity-event.model';

export class LearningActivityEventRepository {
  public async create(
    data: {
      userId: string;
      topicId: string;
      subjectId: string;
      eventType: ActivityEventType;
      occurredAt?: Date;
    },
    session?: ClientSession
  ): Promise<ILearningActivityEventDocument> {
    const eventDoc = new LearningActivityEventModel({
      ...data,
      occurredAt: data.occurredAt || new Date(),
    });
    return await eventDoc.save({ session });
  }

  public async findRecentByUserId(
    userId: string,
    limit: number = 10
  ): Promise<ILearningActivityEventDocument[]> {
    return await LearningActivityEventModel.find({ userId })
      .sort({ occurredAt: -1 })
      .limit(limit)
      .populate('topicId', 'title topicNumber')
      .populate('subjectId', 'name code')
      .exec();
  }

  public async findDistinctUtcActivityDatesByUserId(
    userId: string
  ): Promise<string[]> {
    const results = await LearningActivityEventModel.aggregate<{ _id: string }>([
      {
        $match: {
          userId: new LearningActivityEventModel.base.Types.ObjectId(userId),
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$occurredAt',
              timezone: 'UTC',
            },
          },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    return results.map((r) => r._id);
  }

  public async countByUserId(userId: string): Promise<number> {
    return await LearningActivityEventModel.countDocuments({ userId }).exec();
  }
}

export const learningActivityEventRepository = new LearningActivityEventRepository();
