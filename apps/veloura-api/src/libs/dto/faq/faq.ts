import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { FaqCategory, FaqStatus } from '../../enums/faq';

registerEnumType(FaqStatus, {
  name: 'FaqStatus',
});

@ObjectType()
export class Faq {
  @Field(() => ID)
  _id: string;

  @Field()
  question: string;

  @Field()
  answer: string;

  @Field(() => FaqStatus)
  status: FaqStatus;

  @Field(() => FaqCategory)  
  category: FaqCategory;


  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;
}
