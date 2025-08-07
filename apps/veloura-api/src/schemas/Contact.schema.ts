// src/contact/entities/contact.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true }) // ⬅ enables auto `createdAt`, `updatedAt`
export class Contact {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  subject: string;

  @Prop({ required: true })
  message: string;

  // ✅ DO NOT decorate with @Prop — just define it for typing
  _id: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export type ContactDocument = Contact & Document;

export const ContactSchema = SchemaFactory.createForClass(Contact);
