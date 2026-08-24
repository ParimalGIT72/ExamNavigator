import { ClientSession, FilterQuery } from 'mongoose';
import {
  UserTopicProgressModel,
  IUserTopicProgressDocument,
  TopicProgressStatus,
} from '../models/user-topic-progress.model';

export class UserTopicProgressRepository {
  public async findOne(
    filter: FilterQuery<IUserTopicProgressDocument>,
    session?: ClientSession
  ): Promise<IUserTopicProgressDocument | null> {
    const query = UserTopicProgressModel.findOne(filter);
    if (session) {
      query.session(session);
    }
    return await query.exec();
  }

  public async find(
    filter: FilterQuery<IUserTopicProgressDocument>,
    session?: ClientSession
  ): Promise<IUserTopicProgressDocument[]> {
    const query = UserTopicProgressModel.find(filter);
    if (session) {
      query.session(session);
    }
    return await query.exec();
  }

  public async create(
    data: {
      userId: string;
      topicId: string;
      subjectId: string;
      status: TopicProgressStatus;
      lastProgressUpdatedAt: Date;
    },
    session?: ClientSession
  ): Promise<IUserTopicProgressDocument> {
    const doc = new UserTopicProgressModel(data);
    return await doc.save({ session });
  }

  public async updateStatus(
    userId: string,
    topicId: string,
    status: TopicProgressStatus,
    lastProgressUpdatedAt: Date,
    session?: ClientSession
  ): Promise<IUserTopicProgressDocument | null> {
    return await UserTopicProgressModel.findOneAndUpdate(
      { userId, topicId },
      { status, lastProgressUpdatedAt },
      { new: true, runValidators: true, session }
    ).exec();
  }

  public async deleteOne(
    userId: string,
    topicId: string,
    session?: ClientSession
  ): Promise<boolean> {
    const result = await UserTopicProgressModel.deleteOne(
      { userId, topicId },
      { session }
    ).exec();
    return result.deletedCount > 0;
  }
}

export const userTopicProgressRepository = new UserTopicProgressRepository();
