import { UserModel, IUserDocument } from '../models/user.model';
import { FilterQuery, UpdateQuery } from 'mongoose';

export class UserRepository {
  public async create(userData: Partial<IUserDocument>): Promise<IUserDocument> {
    const user = new UserModel(userData);
    return await user.save();
  }

  public async findById(id: string): Promise<IUserDocument | null> {
    return await UserModel.findById(id).select('+password +refreshToken +verificationToken +resetPasswordToken +resetPasswordExpires +googleId').exec();
  }

  public async findByEmail(email: string, includePrivate: boolean = false): Promise<IUserDocument | null> {
    const query = UserModel.findOne({ email: email.toLowerCase() });
    if (includePrivate) {
      query.select('+password +refreshToken +verificationToken +resetPasswordToken +resetPasswordExpires +googleId');
    }
    return await query.exec();
  }

  public async findByVerificationToken(token: string): Promise<IUserDocument | null> {
    return await UserModel.findOne({ verificationToken: token }).select('+verificationToken').exec();
  }

  public async findByResetToken(token: string): Promise<IUserDocument | null> {
    return await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires').exec();
  }

  public async updateById(id: string, updateData: UpdateQuery<IUserDocument>): Promise<IUserDocument | null> {
    return await UserModel.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }

  public async find(filter: FilterQuery<IUserDocument> = {}): Promise<IUserDocument[]> {
    return await UserModel.find(filter).exec();
  }
}

export const userRepository = new UserRepository();
