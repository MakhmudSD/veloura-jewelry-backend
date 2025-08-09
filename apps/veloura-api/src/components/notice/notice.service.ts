import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { NoticeInput, NoticeInquiry } from '../../libs/dto/notice/notice.input';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { UpdateNoticeInput } from '../../libs/dto/notice/notice.update';
import { NoticeStatus } from '../../libs/enums/notice.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { shapeIntoMongoObjectId } from '../../libs/config';

import { NotificationService } from '../notification/notification.service';
import { NotificationGroup, NotificationType } from '../../libs/enums/notification.enum';
import { Member } from '../../libs/dto/member/member';

@Injectable()
export class NoticeService {
  constructor(
    @InjectModel('Notice') private readonly noticeModel: Model<Notice>,
    @InjectModel('Member') private readonly memberModel: Model<Member>,
    private readonly notificationService: NotificationService,
  ) {}

  // createNotice
  public async createNotice(input: NoticeInput): Promise<Notice> {
    const notice = await this.noticeModel.create(input);

    try {
      const users = await this.memberModel.find({ isActive: true }, { _id: 1 }).lean();

      if (users?.length) {

        await this.notificationService.notifyMany(
          users.map(u => ({
            receiverId: u._id,
            type: NotificationType.NOTICE,
            group: NotificationGroup.ARTICLE,
            title: 'New site notice',
            desc: (input as any).noticeTitle ?? (input as any).title ?? '',
            refId: notice._id,
          })),
        );
      }
    } catch (e) {
      console.error('Broadcast notice notifications failed:', e);
    }

    return notice;
  }

  // getNotices
  public async getNotices(input: NoticeInquiry): Promise<Notices> {
    const { noticeCategory, text, memberId, noticeStatus } = input.search;
    const match: Record<string, any> = {};

    if (noticeStatus) {
      match.noticeStatus = noticeStatus;
    }

    if (noticeCategory) {
      match.noticeCategory = noticeCategory;
    }

    if (text) {
      match.$or = [
        { noticeTitle: { $regex: new RegExp(text, 'i') } },
        { noticeContent: { $regex: new RegExp(text, 'i') } },
      ];
    }

    if (memberId) {
      match.memberId = shapeIntoMongoObjectId(memberId);
    }

    const sort: Record<string, any> = {
      [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC,
    };

    const result = await this.noticeModel
      .aggregate([
        { $match: match },
        { $sort: sort },
        {
          $facet: {
            list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
            metaCounter: [{ $count: 'total' }],
          },
        },
      ])
      .exec();

    if (!result.length) {
      throw new InternalServerErrorException(Message.NO_DATA_FOUND);
    }

    return result[0];
  }

  // getNotice
  public async getNotice(id: string): Promise<Notice> {
    const search = {
      _id: id,
      noticeStatus: NoticeStatus.ACTIVE,
    };

    const notice = await this.noticeModel.findOne(search).exec();
    if (!notice) throw new NotFoundException('Notice not found or inactive');

    return notice;
  }

  // updateNotice
  public async updateNotice(input: UpdateNoticeInput): Promise<Notice> {
    const { _id, ...updateData } = input;

    const updated = await this.noticeModel.findOneAndUpdate(
      { _id, noticeStatus: { $ne: NoticeStatus.DELETED } },
      updateData,
      { new: true },
    );

    if (!updated) throw new NotFoundException('Notice not found or already deleted');
    return updated;
  }

  // deleteNotice (soft delete)
  public async deleteNotice(id: string): Promise<Notice> {
    const updated = await this.noticeModel.findByIdAndUpdate(
      id,
      { noticeStatus: NoticeStatus.DELETED },
      { new: true },
    );

    if (!updated) throw new NotFoundException('Notice not found.');
    return updated;
  }

  // removeNoticePermanently (hard delete; only if already soft-deleted)
  public async removeNoticePermanently(id: string): Promise<Notice> {
    const deleted = await this.noticeModel.findOneAndDelete({
      _id: id,
      noticeStatus: NoticeStatus.DELETED,
    });

    if (!deleted) throw new NotFoundException('Notice not found or not in DELETE status.');
    return deleted;
  }
}
