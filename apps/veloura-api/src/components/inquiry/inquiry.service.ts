// src/component/inquiry/inquiry.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Inquiry } from '../../schemas/Inquiry.schema';
import { CreateInquiryInput, InquiryOutputs, InquiryPaginationInput, ReplyInquiryInput } from '../../libs/dto/inquiry/inquiry';
import { Message } from '../../libs/enums/common.enum';

@Injectable()
export class InquiryService {
  constructor(@InjectModel('Inquiry') private inquiryModel: Model<Inquiry>) {}

  async createInquiry(input: CreateInquiryInput & { memberId: ObjectId }): Promise<Inquiry> {
    return this.inquiryModel.create(input);
  }

  async deleteInquiry(inquiryId: string, memberId: ObjectId): Promise<boolean> {
    const result = await this.inquiryModel.deleteOne({ _id: inquiryId, memberId });
    return result.deletedCount > 0;
  }

  async getPaginatedInquiries(
    memberId: ObjectId,
    input: InquiryPaginationInput,
  ): Promise<InquiryOutputs> {
    const result = await this.inquiryModel
      .aggregate([
        { $match: { memberId } },
        { $sort: { createdAt: -1 } },
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
  
    if (!result.length) throw new InternalServerErrorException('NO_DATA_FOUND');
    return result[0];
  }
  
  async getInquiries() {
    return this.inquiryModel.find().sort({ createdAt: -1 }).populate('memberId');
  }
  async replyToInquiry(input: ReplyInquiryInput): Promise<Inquiry> {
    const inquiry = await this.inquiryModel.findByIdAndUpdate(
      input._id,
      { reply: input.reply },
      { new: true },
    );
    if (!inquiry) throw new Error('Inquiry not found');
    return inquiry;
  }
}
