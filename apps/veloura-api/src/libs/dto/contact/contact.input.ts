import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ContactModel {
  @Field(() => String)
  _id: string;

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

  
}