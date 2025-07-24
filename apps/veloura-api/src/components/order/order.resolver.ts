import { Resolver, Query, Mutation, Args, Context, GqlExecutionContext } from '@nestjs/graphql';
import { OrderService } from './order.service';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/guards/auth.guard';
import { Order } from '../../libs/dto/orders/order';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { OrderUpdateInput } from '../../libs/dto/orders/order.update.';
import { OrderInquiry, OrderItemInput } from '../../libs/dto/orders/order.input.';

@Resolver(() => Order)
export class OrderResolver {
	constructor(private readonly orderService: OrderService) {}

	@Mutation(() => Order)
	@UseGuards(AuthGuard)
	public async createOrder(
		@Args('input', { type: () => [OrderItemInput] }) input: OrderItemInput[],
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Order> {
		console.log('createOrder here');
		const result = await this.orderService.createOrder(memberId, input);
		return result;
	}
	@Query(() => [Order])
	@UseGuards(AuthGuard)
	public async getMyOrders(@Args('input') input: OrderInquiry, @Context() context: any): Promise<Order[]> {
		const req = context.req;

		if (!req.user) {
			throw new Error('Unauthorized: user not found in request');
		}

		const memberId = req.user.memberId || req.user._id || req.user.id;

		console.log('memberId passed to service:', memberId);

		return this.orderService.getMyOrders(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Order)
	public async updateOrder(@Args('input') input: OrderUpdateInput, @Context() context: any): Promise<Order> {
		const req = context.req;

		if (!req.user) throw new Error('Unauthorized: user not found in request');

		const memberId = req.user.memberId || req.user._id || req.user.id;

		if (!memberId) throw new Error('Unauthorized: memberId not found in user');

		return this.orderService.updateOrder(memberId, input);
	}
}
