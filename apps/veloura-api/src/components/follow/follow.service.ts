import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MemberService } from '../member/member.service';
import { Model, ObjectId } from 'mongoose';
import { Follower, Followers, Following, Followings } from '../../libs/dto/follow/follow';
import { Direction, Message } from '../../libs/enums/common.enum';
import {
	lookupAuthMemberFollowed,
	lookupAuthMemberLiked,
	lookupFollowerData,
	lookupFollowingData,
} from '../../libs/config';
import { FollowInquiry } from '../../libs/dto/follow/follow.input';
import { T } from '../../libs/types/common';
import { NotificationService } from '../notification/notification.service';
import { NotificationType, NotificationGroup } from '../../libs/enums/notification.enum';
import { NotificationGateway } from '../notification/notification.gateway';

@Injectable()
export class FollowService {
	constructor(
		@InjectModel('Follow') private readonly followModel: Model<Follower | Following>,
		private memberService: MemberService,
		private notificationService: NotificationService,
		private notificationGateway: NotificationGateway,
	) {}

	// subscribe
	public async subscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		if (followerId.toString() === followingId.toString()) {
			throw new InternalServerErrorException(Message.SELF_SUBSCRIPTION_DENIED);
		}

		const targetMember = await this.memberService.getMember(null, followingId);
		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		// Check if already following
		const exists = await this.followModel.exists({ followerId, followingId });
		if (exists) {
			throw new InternalServerErrorException('Already following this member');
		}

		// Create follow record
		const result = await this.registerSubscription(followerId, followingId);

		// Update stats
		await this.memberService.memberStatsEditor({ _id: followingId, targetKey: 'memberFollowings', modifier: 1 });
		await this.memberService.memberStatsEditor({ _id: followerId, targetKey: 'memberFollowers', modifier: 1 });

		// Get the follower (author) details
			const followerMember = await this.memberService.getMember(null, followerId);
			const memberNick = followerMember?.memberNick ?? 'Someone'; // fallback
		// Create notification only once
		const notification = await this.notificationService.createNotification({
			notificationType: NotificationType.FOLLOW,
			notificationGroup: NotificationGroup.MEMBER,
			notificationTitle: 'New Follower!',
			notificationDesc: `${memberNick} started following you.`,
			authorId: followerId,
			receiverId: followingId,
		});

		this.notificationGateway.sendNotification(followingId.toString(), notification);

		return result;
	}

	// registerSubscription
	private async registerSubscription(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		try {
			return await this.followModel.create({
				followingId: followingId,
				followerId: followerId,
			});
		} catch (err) {
			console.log('ERROR on registerSubscription', err.message);
			throw new InternalServerErrorException(Message.CREATE_FAILED);
		}
	}

	// unsubscribe
	public async unsubscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
		const targetMember = await this.memberService.getMember(null, followingId);
		if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const result = await this.followModel.findOneAndDelete({
			followingId: followingId,
			followerId: followerId,
		});
		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		await this.memberService.memberStatsEditor({ _id: followingId, targetKey: 'memberFollowings', modifier: -1 });
		await this.memberService.memberStatsEditor({ _id: followerId, targetKey: 'memberFollowers', modifier: -1 });

		return result;
	}

	// getMemberFollowings
	public async getMemberFollowings(memberId: ObjectId, input: FollowInquiry): Promise<Followings> {
		const { page, limit, search } = input;
		if (!search?.followerId) throw new InternalServerErrorException(Message.BAD_REQUEST);
		const match: T = { followerId: search.followerId };
		console.log('match:', match);

		const result = await this.followModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: Direction.DESC } },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupAuthMemberLiked(memberId, '$followingId'),
							lookupAuthMemberFollowed({ followerId: memberId, followingId: '$followingId' }),
							lookupFollowingData,
							{ $unwind: { path: '$followingData' } },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	// getMemberFollowers
	public async getMemberFollowers(memberId: ObjectId, input: FollowInquiry): Promise<Followers> {
		const { page, limit, search } = input;
		if (!search?.followingId) throw new InternalServerErrorException(Message.BAD_REQUEST);
		const match: T = { followingId: search.followingId };
		console.log('match:', match);

		const result = await this.followModel
			.aggregate([
				{ $match: match },
				{ $sort: { createdAt: Direction.DESC } },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupAuthMemberLiked(memberId, '$followerId'),
							lookupAuthMemberFollowed({ followerId: memberId, followingId: '$followerId' }),
							lookupFollowerData,
							{ $unwind: { path: '$followerData' } },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}
}
