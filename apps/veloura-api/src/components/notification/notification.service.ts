import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types, isValidObjectId } from 'mongoose';

import { CreateNotificationInput, NotificationsInquiry } from '../../libs/dto/notification/notification.input';
import { NotificationStatus, NotificationType, NotificationGroup } from '../../libs/enums/notification.enum';
import { DeleteNotificationResult, Notification, Notifications } from '../../libs/dto/notification/notification';
import { Member } from '../../libs/dto/member/member';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
	constructor(
		@InjectModel('Notification') private readonly notificationModel: Model<Notification>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		private readonly gateway: NotificationGateway,
	) {}

	public async notify(params: {
		receiverId: string | ObjectId;
		authorId: string | ObjectId;
		type: NotificationType;
		group: NotificationGroup;
		title: string;
		desc?: string;
		productId?: string | ObjectId;
		articleId?: string | ObjectId;
		commentId?: string | ObjectId;
		refId?: string | ObjectId;
	}): Promise<Notification> {
		const input: CreateNotificationInput = {
			notificationType: params.type,
			notificationGroup: params.group,
			notificationTitle: params.title,
			notificationDesc: params.desc,
			receiverId: params.receiverId as any,
			authorId: params.authorId as any,
			productId: params.productId as any,
			articleId: params.articleId as any,
			commentId: params.commentId as any,
			refId: params.refId as any,
		};
		return this.createNotification(input);
	}


	public async notifyMany(
		items: Array<{
			receiverId: string | ObjectId;
			authorId: string | ObjectId;
			type: NotificationType;
			group: NotificationGroup;
			title: string;
			desc?: string;
			productId?: string | ObjectId;
			articleId?: string | ObjectId;
			commentId?: string | ObjectId;
			refId?: string | ObjectId;
		}>,
	): Promise<Notification[]> {
		if (!items?.length) return [];

		for (const i of items) {
			if (!i.receiverId || !i.authorId) {
				throw new BadRequestException('receiverId and authorId are required for notifyMany');
			}
			const r = String(i.receiverId);
			const a = String(i.authorId);
			if (!isValidObjectId(r) || !isValidObjectId(a)) {
				throw new BadRequestException('Invalid receiverId/authorId');
			}
			if (r === a) {
				throw new BadRequestException('receiverId and authorId cannot be the same');
			}
		}

		const docs = items.map((i) => ({
			notificationType: i.type,
			notificationGroup: i.group,
			notificationTitle: i.title,
			notificationDesc: i.desc,
			receiverId: new Types.ObjectId(i.receiverId as any),
			authorId: new Types.ObjectId(i.authorId as any),
			productId: i.productId ? new Types.ObjectId(i.productId as any) : undefined,
			articleId: i.articleId ? new Types.ObjectId(i.articleId as any) : undefined,
			commentId: i.commentId ? new Types.ObjectId(i.commentId as any) : undefined,
			refId: i.refId ? new Types.ObjectId(i.refId as any) : undefined,
			notificationStatus: NotificationStatus.WAIT,
		}));

		const created = await this.notificationModel.insertMany(docs, { ordered: false });

		for (const c of created) {
			try {
				this.gateway.sendNotification(String((c as any).receiverId), {
					kind: 'notification:new',
					_id: String((c as any)._id),
					title: c.notificationTitle,
					desc: c.notificationDesc,
					type: c.notificationType,
					group: c.notificationGroup,
					createdAt: (c as any).createdAt,
				});
			} catch {}
		}

		return created as any;
	}

	public async createNotification(input: CreateNotificationInput): Promise<Notification> {
		if (!input.receiverId) throw new BadRequestException('receiverId is required');
		if (!input.authorId) throw new BadRequestException('authorId is required');

		const receiverId = String(input.receiverId);
		const authorId = String(input.authorId);

		if (!isValidObjectId(receiverId)) throw new BadRequestException('Invalid receiverId');
		if (!isValidObjectId(authorId)) throw new BadRequestException('Invalid authorId');
		if (receiverId === authorId) throw new BadRequestException('receiverId cannot equal authorId');

		const [receiver, author] = await Promise.all([
			this.memberModel.findById(receiverId).lean(),
			this.memberModel.findById(authorId).lean(),
		]);
		if (!receiver) throw new BadRequestException('Receiver does not exist.');
		if (!author) throw new BadRequestException('Author does not exist.');

		if (input.notificationType === NotificationType.FOLLOW) {
			const dup = await this.notificationModel.exists({
				receiverId: new Types.ObjectId(receiverId),
				authorId: new Types.ObjectId(authorId),
				notificationType: NotificationType.FOLLOW,
				createdAt: { $gte: new Date(Date.now() - 1000 * 60 * 10) },
			});
			if (dup) {
				const existing = await this.notificationModel
					.findOne({
						receiverId: new Types.ObjectId(receiverId),
						authorId: new Types.ObjectId(authorId),
						notificationType: NotificationType.FOLLOW,
					})
					.sort({ createdAt: -1 });
				return existing as any;
			}
		}

		const result = await this.notificationModel.create({
			...input,
			receiverId: new Types.ObjectId(receiverId),
			authorId: new Types.ObjectId(authorId),
			notificationStatus: NotificationStatus.WAIT,
		});

		try {
			this.gateway.sendNotification(receiverId, {
				kind: 'notification:new',
				_id: String((result as any)._id),
				title: result.notificationTitle,
				desc: result.notificationDesc,
				type: result.notificationType,
				group: result.notificationGroup,
				createdAt: (result as any).createdAt,
			});
		} catch {
			// ignore WS errors
		}

		return result;
	}

	public async getNotifications(memberId: ObjectId, input: NotificationsInquiry): Promise<Notifications> {
		const { page, limit, search } = input;

		const match: any = { receiverId: new Types.ObjectId(memberId as any) };

		if (search?.notificationType) {
			match.notificationType = search.notificationType;
		}
		if (search?.ownerId && isValidObjectId(search.ownerId)) {
			match.receiverId = new Types.ObjectId(search.ownerId);
		}

		const [agg] = await this.notificationModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: -1 } },
				{
					$lookup: {
						from: 'members',
						localField: 'authorId',
						foreignField: '_id',
						as: 'memberData',
						pipeline: [{ $project: { _id: 1, memberNick: 1, memberImage: 1 } }],
					},
				},
				{ $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
				{
					$facet: {
						list: [{ $skip: (page - 1) * limit }, { $limit: limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const list = agg?.list ?? [];
		const total = agg?.metaCounter?.[0]?.total ?? 0;

		return { list, total } as any;
	}

	public async markNotificationRead(notificationId: string): Promise<Notification> {
		if (!isValidObjectId(notificationId)) {
			throw new BadRequestException('Invalid notification id');
		}
		const result = await this.notificationModel.findByIdAndUpdate(
			notificationId,
			{ notificationStatus: NotificationStatus.READ },
			{ new: true },
		);
		if (!result) throw new NotFoundException(`Notification with id ${notificationId} not found`);
		return result;
	}

	public async markAllNotificationsRead(receiverId: string | ObjectId): Promise<void> {
		if (!isValidObjectId(String(receiverId))) {
			throw new BadRequestException('Invalid receiverId');
		}
		await this.notificationModel.updateMany(
			{ receiverId: new Types.ObjectId(receiverId as any), notificationStatus: NotificationStatus.WAIT },
			{ notificationStatus: NotificationStatus.READ },
		);
	}

	public async deleteNotificationById(input: { id: string }): Promise<DeleteNotificationResult> {
		if (!isValidObjectId(input.id)) {
			return { success: false, message: 'Invalid notification id' };
		}

		const deleted = await this.notificationModel.findByIdAndDelete(input.id);
		if (!deleted) {
			return { success: false, message: 'Notification not found' };
		}

		return { success: true, message: 'Notification deleted successfully' };
	}
}
