import { AuditLogModel, IAuditLogDocument } from '../models/audit-log.model';

export class AuditLogRepository {
  public async log(data: Partial<IAuditLogDocument>): Promise<IAuditLogDocument> {
    const entry = new AuditLogModel(data);
    return await entry.save();
  }

  public async findByUserId(userId: string, limit: number = 50): Promise<IAuditLogDocument[]> {
    return await AuditLogModel.find({ userId }).sort({ createdAt: -1 }).limit(limit).exec();
  }
}

export const auditLogRepository = new AuditLogRepository();
