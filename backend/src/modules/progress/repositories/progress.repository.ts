import { FilterQuery } from 'mongoose';
import {
  UserTopicProgressModel,
  IUserTopicProgressDocument,
  TopicProgressStatus,
} from '../models/user-topic-progress.model';

export class UserTopicProgressRepository {
  public async findOne(
    filter: FilterQuery<IUserTopicProgressDocument>
  ): Promise<IUserTopicProgressDocument | null> {
    return await UserTopicProgressModel.findOne(filter).exec();
  }

  public async find(
    filter: FilterQuery<IUserTopicProgressDocument>
  ): Promise<IUserTopicProgressDocument[]> {
    return await UserTopicProgressModel.find(filter).exec();
  }

  public async create(data: {
    userId: string;
    topicId: string;
    subjectId: string;
    status: TopicProgressStatus;
    lastProgressUpdatedAt: Date;
  }): Promise<IUserTopicProgressDocument> {
    const doc = new UserTopicProgressModel(data);
    return await doc.save();
  }

  public async updateStatus(
    userId: string,
    topicId: string,
    status: TopicProgressStatus,
    lastProgressUpdatedAt: Date
  ): Promise<IUserTopicProgressDocument | null> {
    return await UserTopicProgressModel.findOneAndUpdate(
      { userId, topicId },
      { status, lastProgressUpdatedAt },
      { new: true, runValidators: true }
    ).exec();
  }

  public async deleteOne(userId: string, topicId: string): Promise<boolean> {
    const result = await UserTopicProgressModel.deleteOne({ userId, topicId }).exec();
    return result.deletedCount > 0;
  }
}

export const userTopicProgressRepository = new UserTopicProgressRepository();
