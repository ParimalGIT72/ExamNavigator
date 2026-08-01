import { AnalyticsModel, IAnalyticsDocument } from '../models/analytics.model';
import { UpdateQuery } from 'mongoose';

export class AnalyticsRepository {
  public async findByUserId(userId: string): Promise<IAnalyticsDocument | null> {
    return await AnalyticsModel.findOne({ userId }).exec();
  }

  public async updateByUserId(userId: string, updateData: UpdateQuery<IAnalyticsDocument>): Promise<IAnalyticsDocument | null> {
    return await AnalyticsModel.findOneAndUpdate({ userId }, updateData, { new: true, upsert: true }).exec();
  }
}

export const analyticsRepository = new AnalyticsRepository();
