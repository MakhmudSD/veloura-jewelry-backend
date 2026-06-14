import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NoticeInput, NoticeInquiry } from '../../libs/dto/notice/notice.input';
import { Notice, Notices } from '../../libs/dto/notice/notice';
import { UpdateNoticeInput } from '../../libs/dto/notice/notice.update';
import { NoticeStatus } from '../../libs/enums/notice.enum';
import { Direction, Message } from '../../libs/enums/common.enum';
import { shapeIntoMongoObjectId, toMongoDir } from '../../libs/config';

@Injectable()
export class NoticeService {
	constructor(@InjectModel('Notice') private readonly noticeModel: Model<Notice>) {}

  // createNotice
	public async createNotice(input: NoticeInput): Promise<Notice> {
		const result = await this.noticeModel.create(input);
		return result.save();
	}


  // getNotices
  public async getNotices(input: NoticeInquiry): Promise<Notices> {
	const {  text, memberId, noticeStatus } = input.search;
	const match: Record<string, any> = {};
  
	if (noticeStatus) {
	  match.noticeStatus = noticeStatus;
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
	  [input?.sort ?? 'createdAt']: toMongoDir(input?.direction),
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

		if (!notice) {
			throw new NotFoundException('Notice not found or inactive');
		}

		return notice;
	}


  // updateNotice
	public async updateNotice(input: UpdateNoticeInput): Promise<Notice> {
		const { _id, ...updateData } = input;

		const updated = await this.noticeModel.findOneAndUpdate(
			{
				_id,
				noticeStatus: { $ne: NoticeStatus.DELETED },
			},
			updateData,
			{ new: true },
		);

		if (!updated) {
			throw new NotFoundException('Notice not found or already deleted');
		}

		return updated;
	}


  // deleteNotice
	public async deleteNotice(input: string): Promise<Notice> {
		const updated = await this.noticeModel.findByIdAndUpdate(
			input,
			{ noticeStatus: NoticeStatus.DELETED },
			{ new: true },
		);

		if (!updated) {
			throw new NotFoundException('Notice not found.');
		}

		return updated;
	}


  // removeNoticePermanently  
  public async removeNoticePermanently(id: string): Promise<Notice> {
    const deleted = await this.noticeModel.findOneAndDelete({
      _id: id,
      noticeStatus: NoticeStatus.DELETED,
    });
  
    if (!deleted) {
      throw new NotFoundException('Notice not found or not in DELETE status.');
    }
  
    return deleted;
  }
}