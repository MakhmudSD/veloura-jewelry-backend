import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';

import { NotificationService } from './notification.service';
import { DeleteNotificationResult, Notification, Notifications } from '../../libs/dto/notification/notification';
import { CreateNotificationInput, DeleteNotificationInput, NotificationsInquiry } from '../../libs/dto/notification/notification.input';

@Resolver()
export class NotificationResolver {
	constructor(private readonly notificationService: NotificationService) {}

	// Create from client (author is the authed member)
	@UseGuards(AuthGuard)
	@Mutation(() => Notification)
	public async createNotification(
		@Args('input') input: CreateNotificationInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notification> {
		const finalInput: CreateNotificationInput = {
			...input,
			authorId: memberId as any, // GraphQL String scalar; stored as ObjectId in Mongo
		};
		// Reuse service create (which also pushes WS)
		return this.notificationService.createNotification(finalInput);
	}

	@UseGuards(AuthGuard)
	@Query(() => Notifications)
	public async getNotifications(
		@Args('input') input: NotificationsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Notifications> {
		return this.notificationService.getNotifications(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Notification)
	public async markNotificationRead(@Args('notificationId') notificationId: string) {
		return this.notificationService.markNotificationRead(notificationId);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Boolean)
	public async markAllNotificationsRead(@AuthMember('_id') receiverId: ObjectId) {
		await this.notificationService.markAllNotificationsRead(receiverId);
		return true;
	}

	@UseGuards(AuthGuard)
	@Mutation(() => DeleteNotificationResult)
	async deleteNotificationById(
	  @Args('id', { type: () => String }) id: string,
	): Promise<DeleteNotificationResult> {
	  return this.notificationService.deleteNotificationById({ id });
	}
}
