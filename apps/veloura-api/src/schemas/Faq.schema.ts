import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { FaqCategory, FaqStatus } from '../libs/enums/faq';

@Schema({ timestamps: true })
export class Faq {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  answer: string;

  @Prop({ type: String, enum: FaqStatus, default: FaqStatus.ACTIVE })
  status: FaqStatus;

  @Prop({ type: String, enum: FaqCategory, required: true })
category: FaqCategory;
}

export type FaqDocument = Faq & Document;
export const FaqSchema = SchemaFactory.createForClass(Faq);
