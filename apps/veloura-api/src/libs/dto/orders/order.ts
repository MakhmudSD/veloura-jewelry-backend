import { ObjectType, Field, Int } from '@nestjs/graphql';
import { OrderStatus } from '../../enums/orders.enum';
import { Product } from '../product/product';
import { OrderItem } from './order.input.';

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

	@Field(() => [OrderItem], { nullable: true })
	orderItems?: OrderItem[]; // this fixes the CannotDetermineOutputTypeError

	@Field(() => String)
	memberId: string;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	@Field(() => [Product], { nullable: true })
	productData?: Product[]; // this fixes the CannotDetermineOutputTypeError
}
