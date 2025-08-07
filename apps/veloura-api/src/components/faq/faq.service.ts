import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FaqDocument } from '../../schemas/Faq.schema';
import { FaqInput } from '../../libs/dto/faq/faq.input';
import { UpdateFaqInput } from '../../libs/dto/faq/faq.update';

@Injectable()
export class FaqService {
  constructor(@InjectModel('Faq') private faqModel: Model<FaqDocument>) {}

  async findAll() {
    return this.faqModel.find().sort({ createdAt: -1 });
  }

  async create(input: FaqInput) {
    const created = new this.faqModel(input);
    return created.save();
  }

  async update(input: UpdateFaqInput) {
    const faq = await this.faqModel.findById(input._id);
    if (!faq) throw new NotFoundException('FAQ not found');

    Object.assign(faq, input);
    return faq.save();
  }

  async delete(id: string) {
    const result = await this.faqModel.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }
}
