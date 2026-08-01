import { UserProfileModel, IUserProfileDocument } from '../models/user-profile.model';
import { UpdateQuery } from 'mongoose';

export class UserProfileRepository {
  public async create(profileData: Partial<IUserProfileDocument>): Promise<IUserProfileDocument> {
    const profile = new UserProfileModel(profileData);
    return await profile.save();
  }

  public async findByUserId(userId: string): Promise<IUserProfileDocument | null> {
    return await UserProfileModel.findOne({ userId }).exec();
  }

  public async updateByUserId(userId: string, updateData: UpdateQuery<IUserProfileDocument>): Promise<IUserProfileDocument | null> {
    return await UserProfileModel.findOneAndUpdate({ userId }, updateData, { new: true, upsert: true }).exec();
  }
}

export const userProfileRepository = new UserProfileRepository();
