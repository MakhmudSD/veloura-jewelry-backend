import { InputType, Field, ID, PartialType } from '@nestjs/graphql';
import { FaqInput } from './faq.input';
import { FaqCategory, FaqStatus } from '../../enums/faq';


@InputType()
export class UpdateFaqInput extends PartialType(FaqInput) {
  @Field(() => ID)
  _id: string;

  @Field(() => FaqStatus, { nullable: true })
  status?: FaqStatus;

  @Field(() => FaqCategory, { nullable: true })
  category?: FaqCategory;
}
