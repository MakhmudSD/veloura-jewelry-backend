// src/component/inquiry/inquiry.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Inquiry } from '../../schemas/Inquiry.schema';
import { CreateInquiryInput, ReplyInquiryInput } from '../../libs/dto/inquiry/inquiry';

@Injectable()
export class InquiryService {
  constructor(@InjectModel('Inquiry') private inquiryModel: Model<Inquiry>) {}

  async createInquiry(input: CreateInquiryInput & { memberId: ObjectId }): Promise<Inquiry> {
    return this.inquiryModel.create(input);
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
