import { InputType, Field } from '@nestjs/graphql';
import { FaqCategory, FaqStatus } from '../../enums/faq';

@InputType()
export class FaqInput {
  @Field()
  question: string;

  @Field()
  answer: string;

  @Field(() => FaqStatus, { defaultValue: FaqStatus.ACTIVE })
  status: FaqStatus;

  @Field(() => FaqCategory, { defaultValue: FaqCategory.PRODUCT })
  category: FaqCategory;
}
