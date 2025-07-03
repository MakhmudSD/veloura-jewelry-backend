import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { Notification, Notifications } from '../../libs/dto/notification/notification';
import { CreateNotificationInput, NotificationsInquiry } from '../../libs/dto/notification/notification.input';

@Resolver()
export class NotificationResolver {
	constructor(private readonly notificationService: NotificationService) {}

	@UseGuards(AuthGuard)
	@Query(() => Notifications)
	async getNotifications(
		@Args('input') input: NotificationsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notifications> {
		return this.notificationService.getNotifications(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Notification)
	async createNotification(
		@Args('input') input: CreateNotificationInput,
		@AuthMember('_id') memberId: ObjectId, // optional if you want ownerId to come from auth
	): Promise<Notification> {
		// Optionally inject the ownerId if your input doesn’t include it yet
		const finalInput = {
			...input,
			ownerId: memberId,
		};

		return await this.notificationService.createNotification(finalInput);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Notification)
	async markNotificationRead(@Args('notificationId') notificationId: string) {
		return await this.notificationService.markNotificationRead(notificationId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	async markAllNotificationsRead(@AuthMember('_id') receiverId: ObjectId) {
		await this.notificationService.markAllNotificationsRead(receiverId);
		return true;
	}
}
