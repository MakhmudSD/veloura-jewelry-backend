import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { CreateNotificationInput, NotificationsInquiry } from '../../libs/dto/notification/notification.input';
import { NotificationStatus } from '../../libs/enums/notification.enum';
import { Notification, Notifications } from '../../libs/dto/notification/notification';
import { Member } from '../../libs/dto/member/member';

@Injectable()
export class NotificationService {
	constructor(
		@InjectModel('Notification')
		private readonly notificationModel: Model<Notification>,
		@InjectModel('Member') private readonly memberModel: Model<Member>
	) {}

	// createNotification
	public async createNotification(input: CreateNotificationInput): Promise<Notification> {
		try {
		  console.log('Creating notification:', input);
	  
		  // ✅ Validate receiver exists
		  if (input.receiverId) {
			const receiver = await this.memberModel.findById(input.receiverId).lean();
			if (!receiver) {
			  throw new BadRequestException('Receiver does not exist.');
			}
		  }
	  
		  // ✅ Optionally validate ownerId
		  if (input.authorId) {
			const author = await this.memberModel.findById(input.authorId).lean();
			if (!author) {
			  throw new BadRequestException('Author does not exist.');
			}
		  }
	  
		  const result = await this.notificationModel.create({
			...input,
			notificationStatus: NotificationStatus.WAIT,
		  });
	  
		  console.log('Notification created:', result);
		  return result;
	  
		} catch (error) {
		  console.error('Notification creation failed:', error);
		  throw error;
		}
	  }
	  

	// getNotifications
	public async getNotifications(memberId: ObjectId, input: NotificationsInquiry): Promise<Notifications> {
		const { page, limit } = input;

		const result = await this.notificationModel
			.aggregate([
				{ $match: { receiverId: memberId } },
				{ $sort: { createdAt: -1 } },
				{
					$facet: {
						list: [{ $skip: (page - 1) * limit }, { $limit: limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const data = result[0] || { list: [], metaCounter: [] };

		const total = data.metaCounter.length ? data.metaCounter[0].total : 0;

		return {
			list: data.list,
			total,
		};
	}

	// markNotificationRead
	public async markNotificationRead(notificationId: string): Promise<Notification> {
		const result = await this.notificationModel.findByIdAndUpdate(
		  notificationId,
		  { notificationStatus: NotificationStatus.READ },
		  { new: true },
		);
	  
		if (!result) {
		  throw new NotFoundException(`Notification with id ${notificationId} not found`);
		}
	  
		return result;
	  }

	// markAllNotificationsRead
	public async markAllNotificationsRead(receiverId: string | ObjectId): Promise<void> {
		await this.notificationModel.updateMany(
			{ receiverId, notificationStatus: NotificationStatus.WAIT },
			{ notificationStatus: NotificationStatus.READ },
		);
	}
}
