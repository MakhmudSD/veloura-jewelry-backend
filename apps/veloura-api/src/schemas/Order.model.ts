import { Schema, Types } from 'mongoose';

const OrderItemSchema = new Schema({
  productId: { type: Types.ObjectId, ref: 'Product', required: true },
  itemQuantity: { type: Number, required: true },
  itemPrice: { type: Number, required: true },
});

const OrderSchema = new Schema(
  {
    orderTotal: { type: Number, required: true },
    orderDelivery: { type: Number, required: true },
    orderStatus: { type: String, enum: ['FINISH', 'PROCESS', 'PAUSE', 'DELETE'], required: true },
    memberId: { type: Types.ObjectId, ref: 'Member', required: true },
    orderItems: [OrderItemSchema],
    productData: [{ type: Types.ObjectId, ref: 'Product' }],
  },
  { timestamps: true },
);

export { OrderSchema, OrderItemSchema };