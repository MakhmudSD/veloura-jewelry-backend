import { Schema } from 'mongoose';

const ProductSnapshotSchema = new Schema(
	{
	  _id: { type: Schema.Types.ObjectId, ref: 'Product' },
	  productTitle: String,
	  productPrice: Number,
	  productImages: [String],
	  memberId: { type: Schema.Types.ObjectId, ref: 'Member' },
	  memberNick: String,
	},
	{ _id: false }
  );

const OrderItemSchema = new Schema(
	{
    itemQuantity: { type: Number, required: true, min: 1 },
    itemPrice:    { type: Number, required: true, min: 0 },
    orderId:      { type: Schema.Types.ObjectId, ref: 'Order' },
    productId:    { type: Schema.Types.ObjectId, ref: 'Product' },

    // ✅ snapshot of product at purchase time
    productData:  { type: ProductSnapshotSchema, required: false },
  },
	{
		timestamps: true,
		collection: 'orderItems',
	},
);

export default OrderItemSchema;
