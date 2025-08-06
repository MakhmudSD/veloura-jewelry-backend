import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { InquiryType } from '../../enums/inquiry';
import { Member, MemberOutput } from '../member/member';


@InputType()
export class CreateInquiryInput {
  
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



@ObjectType()
export class InquiryOutput {
  @Field(() => String)
  _id: string;

  @Field(() => InquiryType)
  inquiryType: InquiryType;

  @Field(() => String)
  content: string;

  @Field(() => String, { nullable: true })
  reply?: string;

  @Field(() => MemberOutput)  // ❗ updated from String to MemberOutput
  memberId: MemberOutput;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}

@ObjectType()
export class TotalInquiries {
  @Field(() => Int, { nullable: true })
  total?: number;
}

@ObjectType()
export class InquiryOutputs {
  @Field(() => [InquiryOutput])
  list: InquiryOutput[];

  @Field(() => [TotalInquiries], { nullable: true })
  metaCounter: TotalInquiries[];
}


@InputType()
export class InquiryPaginationInput {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
}