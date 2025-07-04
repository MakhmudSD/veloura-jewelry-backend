import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { NoticeInput, NoticeInquiry } from '../../libs/dto/notice/notice.input';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { UpdateNoticeInput } from '../../libs/dto/notice/notice.update';
import { NoticeStatus } from '../../libs/enums/notice.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class NoticeService {
	constructor(@InjectModel('Notice') private readonly noticeModel: Model<Notice>) {}

	public async createNotice(input: NoticeInput): Promise<Notice> {
		const result = await this.noticeModel.create(input);
		return result.save();
	}


      public async getNotices(input: NoticeInquiry): Promise<Notices> {
        const {noticeCategory, text, memberId } = input.search;
        const match: Record<string, any> = {
          noticeStatus: NoticeStatus.ACTIVE,
        };
    
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
                list: [
                  { $skip: (input.page - 1) * input.limit },
                  { $limit: input.limit },
                ],
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
    
 
      public async getNotice(id: string): Promise<Notice> {
        const search = {
          _id: id,
          noticeStatus: NoticeStatus.ACTIVE,
        };
      
        const notice = await this.noticeModel.findOne(search).exec();
      
        if (!notice) {
          throw new NotFoundException('Notice not found or inactive');
        }
      
        return notice;
      }
      
      public async updateNotice(id: string, input: UpdateNoticeInput): Promise<Notice> {
        // Update only if notice is not deleted
        const updated = await this.noticeModel.findOneAndUpdate(
          { _id: id, noticeStatus: { $ne: NoticeStatus.DELETE } },
          input,
          { new: true },
        );
        if (!updated) throw new NotFoundException('Notice not found or already deleted');
        return updated;
      }
      
      public async remove(id: string): Promise<boolean> {
        // Soft delete: set noticeStatus to DELETE
        const updated = await this.noticeModel.findByIdAndUpdate(
          id,
          { noticeStatus: NoticeStatus.DELETE },
          { new: true },
        );
        return !!updated;
      }
}
