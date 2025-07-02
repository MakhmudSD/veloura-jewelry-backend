import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { NotificationService } from './notification.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { Notification } from '../../libs/dto/notification/notification';
import { CreateNotificationInput } from '../../libs/dto/notification/notification.input';

@Resolver()
export class NotificationResolver {
	constructor(private readonly notificationService: NotificationService) {}

	@UseGuards(AuthGuard)
	@Query(() => [Notification])
	async getNotifications(@AuthMember('_id') receiverId: ObjectId) {
		return await this.notificationService.getNotificationsForUser(receiverId);
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
