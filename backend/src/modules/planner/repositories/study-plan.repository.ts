import { StudyPlanModel, IStudyPlanDocument } from '../models/study-plan.model';
import { UpdateQuery } from 'mongoose';

export class StudyPlanRepository {
  public async create(data: Partial<IStudyPlanDocument>): Promise<IStudyPlanDocument> {
    const plan = new StudyPlanModel(data);
    return await plan.save();
  }

  public async findByUserId(userId: string): Promise<IStudyPlanDocument[]> {
    return await StudyPlanModel.find({ userId, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).exec();
  }

  public async updateById(id: string, updateData: UpdateQuery<IStudyPlanDocument>): Promise<IStudyPlanDocument | null> {
    return await StudyPlanModel.findOneAndUpdate({ _id: id, isDeleted: { $ne: true } }, updateData, { new: true }).exec();
  }

  public async softDelete(id: string): Promise<IStudyPlanDocument | null> {
    return await StudyPlanModel.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    ).exec();
  }
}

export const studyPlanRepository = new StudyPlanRepository();
