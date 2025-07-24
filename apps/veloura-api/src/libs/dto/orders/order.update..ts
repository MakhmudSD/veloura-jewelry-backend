import { InputType, Field, Int } from '@nestjs/graphql';
import { OrderStatus } from '../../enums/orders.enum';

@InputType()
export class OrderUpdateInput {
	@Field(() => String)
	orderId: string;

	@Field(() => OrderStatus)
	orderStatus: OrderStatus;

	@Field(() => Int, { nullable: true })
	itemPrice: number;

	@Field(() => Int, { nullable: true })
	itemQuantity?: number;
}
