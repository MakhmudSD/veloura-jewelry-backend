import { ObjectType, Field, Int, ID, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { OrderStatus } from '../../enums/orders.enum';

@ObjectType()
export class OrderItem {
	@Field(() => String)
	id: ObjectId;

	@Field(() => Int)
	itemQuantity: number;

	@Field(() => Int)
	itemPrice: number;

	@Field(() => String)
	productId: ObjectId;

	@Field(() => String, { nullable: true })
	orderId?: ObjectId;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

@InputType()
export class OrderItemInput {
	@Field(() => String)
	@IsNotEmpty()
	productId: string;

	@Field(() => Int)
	@IsNotEmpty()
	itemQuantity: number;

	@Field(() => Int)
	@IsNotEmpty()
	itemPrice: number;

	@Field(() => String, { nullable: true })
	@IsOptional()
	orderId?: ObjectId;
}

@InputType()
export class OrderInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsNotEmpty()
	@Field(() => OrderStatus)
	orderStatus: OrderStatus;
}
