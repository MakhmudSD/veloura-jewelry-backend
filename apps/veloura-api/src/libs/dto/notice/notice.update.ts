import { Field, InputType } from '@nestjs/graphql';
import { NoticeCategory, NoticeStatus } from '../../enums/notice.enum';

@InputType()
export class UpdateNoticeInput {
  @Field(() => NoticeCategory, { nullable: true })
  noticeCategory?: NoticeCategory;

  @Field(() => NoticeStatus, { nullable: true })
  noticeStatus?: NoticeStatus;

  @Field({ nullable: true })
  noticeTitle?: string;

  @Field({ nullable: true })
  noticeContent?: string;
}
