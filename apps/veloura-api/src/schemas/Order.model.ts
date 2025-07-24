import mongoose, { Schema } from 'mongoose';
import { OrderStatus } from '../libs/enums/orders.enum';

const OrderSchema = new Schema(
	{
		orderTotal: {
			type: Number,
			required: true,
			min: 0,
		},

		orderDelivery: {
			type: Number,
			required: true,
			min: 0,
		},

		orderStatus: {
			type: String,
			enum: Object.values(OrderStatus),
			default: OrderStatus.PAUSE,
			trim: true,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			ref: 'Member',
		},
	},
	{ timestamps: true, collection: 'orders' },
);

export default OrderSchema;
