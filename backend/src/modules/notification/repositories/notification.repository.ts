import { NotificationModel, INotificationDocument } from '../models/notification.model';

export class NotificationRepository {
  public async create(data: Partial<INotificationDocument>): Promise<INotificationDocument> {
    const notification = new NotificationModel(data);
    return await notification.save();
  }

  public async findByUserId(userId: string, unreadOnly: boolean = false): Promise<INotificationDocument[]> {
    const query: any = { userId };
    if (unreadOnly) query.isRead = false;
    return await NotificationModel.find(query).sort({ createdAt: -1 }).exec();
  }

  public async markAsRead(id: string): Promise<INotificationDocument | null> {
    return await NotificationModel.findByIdAndUpdate(
      id,
      { isRead: true, readAt: new Date() },
      { new: true }
    ).exec();
  }
}

export const notificationRepository = new NotificationRepository();
