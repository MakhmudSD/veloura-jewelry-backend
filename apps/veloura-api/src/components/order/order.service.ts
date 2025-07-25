import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Schema } from 'mongoose';
import { Order } from '../../libs/dto/orders/order';
import { OrderInquiry, OrderItem, OrderItemInput } from '../../libs/dto/orders/order.input.';
import { MemberService } from '../member/member.service';
import { Member } from '../../libs/dto/member/member';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Message } from '../../libs/enums/common.enum';
import { OrderUpdateInput } from '../../libs/dto/orders/order.update.';
import { OrderStatus } from '../../libs/enums/orders.enum';

@Injectable()
export class OrderService {
	constructor(
		@InjectModel('Order') private readonly orderModel: Model<Order>,
		@InjectModel('OrderItem') private readonly orderItemModel: Model<OrderItem>,
		private readonly memberService: MemberService,
	) {}

	async createOrder(memberId: ObjectId, input: OrderItemInput[]): Promise<Order> {
		const amount = input.reduce((acc, item) => acc + item.itemPrice * item.itemQuantity, 0);
		const delivery = amount < 500000 ? 30000 : 0;

		try {
			const newOrder = await this.orderModel.create({
				orderTotal: amount + delivery,
				orderDelivery: delivery,
				memberId,
			});

			await this.recordOrderItems(shapeIntoMongoObjectId(newOrder._id), input);
			return newOrder;
		} catch (err) {
			console.error('ERROR on createOrder:', err);
			throw new Error(Message.CREATE_FAILED);
		}
	}

	private async recordOrderItems(orderId: ObjectId, input: OrderItemInput[]): Promise<void> {
		const tasks = input.map(async (item) => {
			item.orderId = orderId;
			item.productId = shapeIntoMongoObjectId(item.productId);
			await this.orderItemModel.create(item);
		});

		await Promise.all(tasks);
	}

	async getMyOrders(memberId: ObjectId, inquiry: OrderInquiry): Promise<Order[]> {
		if (!memberId) {
			throw new Error('Invalid memberId');
		}
	
		const result = await this.orderModel.aggregate([
			{ $match: { memberId } },
			{ $sort: { updatedAt: -1 } },
			{ $skip: (inquiry.page - 1) * inquiry.limit },
			{ $limit: inquiry.limit },
	
			// Lookup orderItems
			{
				$lookup: {
					from: 'orderitems',
					localField: '_id',
					foreignField: 'orderId',
					as: 'orderItems',
				},
			},
			{ $unwind: { path: '$orderItems', preserveNullAndEmptyArrays: true } },
	
			// Lookup product info
			{
				$lookup: {
					from: 'products',
					localField: 'orderItems.productId',
					foreignField: '_id',
					as: 'productData',
				},
			},
			{ $unwind: { path: '$productData', preserveNullAndEmptyArrays: true } },
	
			// Merge productData into orderItems
			{
				$addFields: {
					'orderItems.productData': '$productData',
				},
			},
	
			// Group back orders
			{
				$group: {
					_id: '$_id',
					orderTotal: { $first: '$orderTotal' },
					orderDelivery: { $first: '$orderDelivery' },
					orderStatus: { $first: '$orderStatus' },
					memberId: { $first: '$memberId' },
					createdAt: { $first: '$createdAt' },
					updatedAt: { $first: '$updatedAt' },
					orderItems: { $push: '$orderItems' },
				},
			},
	
			{ $sort: { updatedAt: -1 } },
		]).exec();
	
		if (!result || result.length === 0) {
			throw new Error('No data found!');
		}
	
		return result;
	}
	

	// Service
	public async updateOrder(memberId: ObjectId, input: OrderUpdateInput): Promise<Order> {
		if (!memberId) {
			throw new Error('Invalid memberId');
		}

		const shapedMemberId = shapeIntoMongoObjectId(memberId);
		const orderId = shapeIntoMongoObjectId(input.orderId);
		const orderStatus = input.orderStatus;

		console.log('Updating order with:', {
			memberId: shapedMemberId.toString(),
			orderId: orderId.toString(),
			orderStatus,
		});

		const updateData: Partial<Order> = {
			orderStatus,
		};

		const updatedOrder = await this.orderModel
			.findOneAndUpdate({ memberId: shapedMemberId, _id: orderId }, updateData, { new: true })
			.exec();

		if (!updatedOrder) {
			console.error('No order found to update for given memberId and orderId');
			throw new Error(Message.UPDATE_FAILED);
		}

		if (orderStatus === OrderStatus.PROCESS) {
			await this.memberService.addUserPoint(shapedMemberId, 10000);

			console.log(`Added 10000 points to memberId: ${shapedMemberId}`);
		}

		return updatedOrder as Order;
	}
}
