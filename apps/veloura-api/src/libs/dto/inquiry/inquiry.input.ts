import { Field, InputType } from '@nestjs/graphql';
import { InquiryType } from '../../enums/inquiry';

@InputType()
export class InquiryInput {
  @Field(() => InquiryType)
  inquiryType: InquiryType;

  @Field(() => String)
  content: string;
}

@InputType()
export class ReplyInquiryInput {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  reply: string;
}
