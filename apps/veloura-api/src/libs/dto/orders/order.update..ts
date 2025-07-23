import { InputType, Field } from '@nestjs/graphql';
import { OrderStatus } from '../../enums/orders.enum';

@InputType()
export class OrderUpdateInput {
  @Field(() => String)
  orderId: string;

  @Field(() => OrderStatus)
  orderStatus: OrderStatus;
}