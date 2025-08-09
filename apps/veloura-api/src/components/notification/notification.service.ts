import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';

import {
  CreateNotificationInput,
  DeleteNotificationInput,
  NotificationsInquiry,
} from '../../libs/dto/notification/notification.input';
import {
  NotificationStatus,
  NotificationType,
  NotificationGroup,
} from '../../libs/enums/notification.enum';
import {
  DeleteNotificationResult,
  Notification,
  Notifications,
} from '../../libs/dto/notification/notification';
import { Member } from '../../libs/dto/member/member';
import { NotificationGateway } from './notification.gateway';

@Injectable()
export class NotificationService {
  constructor(
    @InjectModel('Notification') private readonly notificationModel: Model<Notification>,
    @InjectModel('Member') private readonly memberModel: Model<Member>,
    private readonly gateway: NotificationGateway,
  ) {}

  /**
   * One-liner helper to create & push a notification from any feature.
   */
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

  /**
   * Bulk helper (broadcast to many receivers).
   */
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

    // (Optional) quick validation: ensure all receivers/authors exist
    // Skipped for speed; rely on DB integrity if desired.

    const docs = items.map((i) => ({
      notificationType: i.type,
      notificationGroup: i.group,
      notificationTitle: i.title,
      notificationDesc: i.desc,
      receiverId: i.receiverId as any,
      authorId: i.authorId as any,
      productId: i.productId as any,
      articleId: i.articleId as any,
      commentId: i.commentId as any,
      refId: i.refId as any,
      notificationStatus: NotificationStatus.WAIT,
    }));

    const created = await this.notificationModel.insertMany(docs);

    // Best-effort WS push
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

  /**
   * createNotification (validates & pushes via WS)
   */
  public async createNotification(input: CreateNotificationInput): Promise<Notification> {
    // Validate receiver
    if (input.receiverId) {
      const receiver = await this.memberModel.findById(input.receiverId).lean();
      if (!receiver) throw new BadRequestException('Receiver does not exist.');
    }
    // Validate author
    if (input.authorId) {
      const author = await this.memberModel.findById(input.authorId).lean();
      if (!author) throw new BadRequestException('Author does not exist.');
    }

    const result = await this.notificationModel.create({
      ...input,
      notificationStatus: NotificationStatus.WAIT,
    });

    // Fire WS push (non-blocking)
    try {
      this.gateway.sendNotification(String(input.receiverId), {
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

  /**
   * getNotifications
   * Includes a minimal author mini-profile as `memberData` via $lookup.
   */
  public async getNotifications(memberId: ObjectId, input: NotificationsInquiry): Promise<Notifications> {
    const { page, limit, search } = input;

    const match: any = { receiverId: memberId };

    if (search?.notificationType) {
      match.notificationType = search.notificationType;
    }
    // Your DTO has `ownerId` in search. Interpret it as receiverId filter if present.
    if (search?.ownerId) {
      match.receiverId = new Types.ObjectId(search.ownerId);
    }

    const [agg] = await this.notificationModel
      .aggregate([
        { $match: match },
        { $sort: { createdAt: -1 } },
        // ---- attach author mini profile as memberData ----
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
    const result = await this.notificationModel.findByIdAndUpdate(
      notificationId,
      { notificationStatus: NotificationStatus.READ },
      { new: true },
    );
    if (!result) throw new NotFoundException(`Notification with id ${notificationId} not found`);
    return result;
  }

  public async markAllNotificationsRead(receiverId: string | ObjectId): Promise<void> {
    await this.notificationModel.updateMany(
      { receiverId, notificationStatus: NotificationStatus.WAIT },
      { notificationStatus: NotificationStatus.READ },
    );
  }

  public async deleteNotificationById(
	input: { id: string }
  ): Promise<DeleteNotificationResult> {
	if (!Types.ObjectId.isValid(input.id)) {
	  return { success: false, message: 'Invalid notification id' };
	}
  
	const deleted = await this.notificationModel.findByIdAndDelete(input.id);
	if (!deleted) {
	  return { success: false, message: 'Notification not found' };
	}
  
	return { success: true, message: 'Notification deleted successfully' };
  }
}
