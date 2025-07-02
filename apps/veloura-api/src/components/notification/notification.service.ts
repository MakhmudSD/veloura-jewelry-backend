import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { CreateNotificationInput } from '../../libs/dto/notification/notification.input';
import { NotificationStatus } from '../../libs/enums/notification.enum';
import { Notification } from '../../libs/dto/notification/notification';

@Injectable()
export class NotificationService {
	constructor(
		@InjectModel('Notification')
		private readonly notificationModel: Model<Notification>,
	) {}

	async createNotification(input: CreateNotificationInput): Promise<Notification> {
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
