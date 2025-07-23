import { ObjectType, Field, Int } from '@nestjs/graphql';
import { OrderStatus } from '../../enums/orders.enum';
import { OrderItemInput } from './order.input.';
import { Product } from '../product/product';

@ObjectType()
export class Order {
	@Field(() => String)
	_id: string;

	@Field(() => Int)
	orderTotal: number;

	@Field(() => Int)
	orderDelivery: number;

	@Field(() => OrderStatus)
	orderStatus: OrderStatus;

	@Field(() => String)
	memberId: string;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	@Field(() => [OrderItemInput])
	orderItems: OrderItemInput[];

	@Field(() => [Product])
	productData: Product[];
}
