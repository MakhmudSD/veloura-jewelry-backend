import { InputType, Field, Int } from '@nestjs/graphql';
import { OrderStatus } from '../../enums/orders.enum';

@InputType()
export class OrderItemInput {
  @Field(() => Int)
  itemQuantity: number;

  @Field(() => Int)
  itemPrice: number;

  @Field(() => String)
  productId: string;

  @Field(() => String, { nullable: true })
  orderId?: string;
}

@InputType()
export class OrderInquiry {
  @Field(() => Int)
  page: number;

  @Field(() => Int)
  limit: number;
 
  @Field(() => OrderStatus)
  orderStatus: OrderStatus;
}