import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Schema, Types } from 'mongoose';
import { Follower, Following, Followings } from '../../libs/dto/follow/follow';
import { MemberService } from '../member/member.service';
import { Direction, Message } from '../../libs/enums/common.enum';
import { FollowInquiry } from '../../libs/dto/follow/follow.input';
import { T } from '../../libs/types/common';
import { lookupAuthMemberFollowed, lookupAuthMemberLiked, lookupFollowerData, lookupFollowingData } from '../../libs/config';
import { NotificationGroup, NotificationType } from '../../libs/enums/notification.enum';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel('Follow') private readonly followModel: Model<Follower | Following>,
    private memberService: MemberService,
    private notificationService: NotificationService,
  ) {}

  public async subscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
    const follower = new Types.ObjectId(followerId as any);
    const following = new Types.ObjectId(followingId as any);

    if (following.equals(follower)) {
      throw new BadRequestException(Message.SELF_SUBSCRIPTION_DENIED);
    }

    const targetMember = await this.memberService.getMember(null, following as unknown as Schema.Types.ObjectId);
    if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    // Avoid duplicate follows (idempotent)
    const existing = await this.followModel.findOne({ followerId: follower, followingId: following }).lean();
    if (existing) return existing as any;

    const result = await this.registerSubscription(follower, following);

    await this.memberService.memberStatsEditor({ _id: follower as unknown as ObjectId, targetKey: 'memberFollowings', modifier: 1 });
    await this.memberService.memberStatsEditor({ _id: following as unknown as ObjectId, targetKey: 'memberFollowers',  modifier: 1 });

    // Fire notification (server-side receiverId/authorId both present)
    await this.notificationService.notify({
      receiverId: targetMember._id,
      authorId: follower as unknown as string | ObjectId,
      type: NotificationType.FOLLOW,
      group: NotificationGroup.MEMBER,
      title: 'New follower',
      desc: '', // optional
    });

    return result;
  }

  private async registerSubscription(followerId: Types.ObjectId, followingId: Types.ObjectId): Promise<Follower> {
      try {
        return await this.followModel.create({
          followingId,
          followerId,
        });
      } catch (err: any) {
        // E11000 duplicate key (in case unique index exists)
        if (err?.code === 11000) return await this.followModel.findOne({ followerId, followingId }) as any;
        console.log('Error, Service.model:', err.message);
        throw new BadRequestException(Message.CREATE_FAILED);
      }
    }

  public async unsubscribe(followerId: ObjectId, followingId: ObjectId): Promise<Follower> {
    const follower = new Types.ObjectId(followerId as any);
    const following = new Types.ObjectId(followingId as any);

    const targetMember = await this.memberService.getMember(null, following as unknown as Schema.Types.ObjectId);
    if (!targetMember) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    const result = await this.followModel.findOneAndDelete({ followerId: follower, followingId: following });
    if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

    await this.memberService.memberStatsEditor({ _id: follower as unknown as Schema.Types.ObjectId, targetKey: 'memberFollowings', modifier: -1 });
    await this.memberService.memberStatsEditor({ _id: following as unknown as ObjectId, targetKey: 'memberFollowers',  modifier: -1 });

    return result;
  }

  public async getMemberFollowings(memberId: ObjectId, input: FollowInquiry): Promise<Followings> {
    const { page, limit, search } = input;
    if (!search?.followerId) throw new BadRequestException(Message.BAD_REQUEST);
    const match: T = { followerId: search.followerId };

    const [agg] = await this.followModel
      .aggregate([
        { $match: match },
        { $sort: { createdAt: Direction.DESC } },
        {
          $facet: {
            list: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              lookupAuthMemberLiked(memberId, '$followingId'),
              lookupAuthMemberFollowed(memberId, '$followingId'),
              lookupFollowingData,
              { $unwind: '$followingData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    // facet always returns one doc; normalize
    return {
      list: agg?.list ?? [],
      metaCounter: agg?.metaCounter ?? [],
    } as any;
  }

  public async getMemberFollowers(memberId: ObjectId, input: FollowInquiry): Promise<Followings> {
    const { page, limit, search } = input;
    if (!search?.followingId) throw new BadRequestException(Message.BAD_REQUEST);
    const match: T = { followingId: search.followingId };

    const [agg] = await this.followModel
      .aggregate([
        { $match: match },
        { $sort: { createdAt: Direction.DESC } },
        {
          $facet: {
            list: [
              { $skip: (page - 1) * limit },
              { $limit: limit },
              lookupAuthMemberLiked(memberId, '$followerId'),
              lookupAuthMemberFollowed(memberId, '$followerId'),
              lookupFollowerData,
              { $unwind: '$followerData' },
            ],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    return {
      list: agg?.list ?? [],
      metaCounter: agg?.metaCounter ?? [],
    } as any;
  }
}
export default FollowService;
