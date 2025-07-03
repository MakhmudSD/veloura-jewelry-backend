import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateNotificationInput, NotificationsInquiry } from '../../libs/dto/notification/notification.input';
import { NotificationStatus } from '../../libs/enums/notification.enum';
import { Notification, Notifications } from '../../libs/dto/notification/notification';

@Injectable()
export class NotificationService {
	constructor(
		@InjectModel('Notification')
		private readonly notificationModel: Model<Notification>,
	) {}

	public async getNotifications(memberId: ObjectId, input: NotificationsInquiry): Promise<Notifications> {
		const { page, limit } = input;
	  
		const result = await this.notificationModel.aggregate([
		  { $match: { ownerId: memberId } },
		  { $sort: { createdAt: -1 } },
		  {
			$facet: {
			  list: [
				{ $skip: (page - 1) * limit },
				{ $limit: limit },
			  ],
			  metaCounter: [{ $count: 'total' }],
			},
		  },
		]).exec();
	  
		const data = result[0] || { list: [], metaCounter: [] };
	  
		const total = data.metaCounter.length ? data.metaCounter[0].total : 0;
	  
		return {
		  list: data.list,
		  total,   // ✅ Always defined!
		};
	  }
	  
	  
	public async createNotification(input: CreateNotificationInput): Promise<Notification> {
		const result = await this.notificationModel.create({
			...input,
			notificationStatus: NotificationStatus.WAIT,
		});
		// TODO: emit via websocket here later!
		return result;
	}

	async getNotificationsForUser(receiverId: string | ObjectId): Promise<Notification[]> {
		return await this.notificationModel
			.find({
				receiverId,
				notificationStatus: { $in: [NotificationStatus.WAIT, NotificationStatus.READ] },
			})
			.sort({ createdAt: -1 })
			.exec();
	}

	async markNotificationRead(notificationId: string): Promise<Notification> {
		const result = await this.notificationModel.findByIdAndUpdate(
			notificationId,
			{ notificationStatus: NotificationStatus.READ },
			{ new: true },
		);
		return result as unknown as Notification;
	}

	async markAllNotificationsRead(receiverId: string | ObjectId): Promise<void> {
		await this.notificationModel.updateMany(
			{ receiverId, notificationStatus: NotificationStatus.WAIT },
			{ notificationStatus: NotificationStatus.READ },
		);
	}
}
