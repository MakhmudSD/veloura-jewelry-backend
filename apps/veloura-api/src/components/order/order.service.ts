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
import { Product } from '../../libs/dto/product/product';
import { NotificationService } from '../notification/notification.service';
import { NotificationGroup, NotificationType } from '../../libs/enums/notification.enum';

@Injectable()
export class OrderService {
	constructor(
		@InjectModel('Order') private readonly orderModel: Model<Order>,
		@InjectModel('Product') private readonly productModel: Model<Product>, // Corrected the type from Model<Order> to Model<Product>
		@InjectModel('OrderItem') private readonly orderItemModel: Model<OrderItem>,
		private readonly memberService: MemberService,
		private readonly notificationService: NotificationService,
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
			await this.notificationService.notify({
				receiverId: newOrder._id,
				authorId: newOrder.memberId,  // or a system/admin id
				type: NotificationType.ORDER,
				group: NotificationGroup.PRODUCT,
				title: 'Order placed',
				desc: `Order #${newOrder._id}`,
				refId: newOrder._id,
				// Removed productId as it does not exist on the Order type
			  });
		  
			  // 3) optionally notify seller
			  await this.notificationService.notify({
				receiverId: newOrder._id,
				authorId: newOrder.memberId,
				type: NotificationType.ORDER,
				group: NotificationGroup.PRODUCT,
				title: 'You received a new order',
				desc: `Order #${newOrder._id}`,
				refId: newOrder._id,
				productId: newOrder._id,	
			  });
			return newOrder;
		} catch (err) {
			console.error('ERROR on createOrder:', err);
			throw new Error(Message.CREATE_FAILED);
		}
	}

	async recordOrderItems(orderId: ObjectId, items: OrderItemInput[]) {
		const enrichedItems = await Promise.all(
		  items.map(async (item) => {
			const product = await this.productModel
			  .findById(item.productId)
			  .populate('memberId', 'memberNick') // ✅ get seller nick
			  .lean();
	  
			return {
			  orderId,
			  productId: item.productId,
			  itemQuantity: item.itemQuantity,
			  itemPrice: item.itemPrice,
			  productData: {
				_id: product?._id,
				productTitle: product?.productTitle,
				productPrice: product?.productPrice,
				productImages: Array.isArray(product?.productImages) ? product.productImages : [],
				memberId: (product?.memberId as any)?._id || product?.memberId || null,
				memberNick: (product as any)?.memberId?.memberNick || '',
			  },
			};
		  })
		);
	  
		await this.orderItemModel.insertMany(enrichedItems);
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
