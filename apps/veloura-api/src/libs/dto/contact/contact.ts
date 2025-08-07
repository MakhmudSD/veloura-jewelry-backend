// src/contact/dto/create-contact.input.ts
import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Types } from 'mongoose';

@InputType()
export class CreateContactInput {
  @Field()
  name: string;

  @Field()
  email: string;

  @Field()
  subject: string;

  @Field()
  message: string;

  @Field(() => Date, { nullable: true })
  createdAt?: Date;

    // Optional: explicitly declare _id to override 'unknown'
    _id: Types.ObjectId;

}

