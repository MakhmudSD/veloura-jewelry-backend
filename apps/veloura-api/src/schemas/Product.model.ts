import { Schema } from 'mongoose';
import {
	ProductStatus,
	ProductMaterial,
	ProductGender,
	ProductLocation,
	ProductCategory,
} from '../libs/enums/product.enum';

const ProductSchema = new Schema(
	{
		productCategory: {
			type: String,
			enum: ProductCategory,
			default: ProductCategory.RING,
			required: true,
		},

		productBrand: {
			type: String,
		},


		productLocation: {
			type: String,
			enum: ProductLocation,
			required: true,
		},

		productStatus: {
			type: String,
			enum: ProductStatus,
			default: ProductStatus.AVAILABLE,
		},

		productColor: {
			type: String,
			required: true,
		},

		productMaterial: {
			type: String,
			enum: ProductMaterial,
			required: true,
		},

		productGender: {
			type: String,
			enum: ProductGender,
		},

		productTitle: {
			type: String,
			required: true,
		},

		productPrice: {
			type: Number,
			required: true,
		},

		productSize: {
			type: Number,
			default: 0,
		},

		productStock: {
			type: Number,
			default: 0,
		},

		productViews: {
			type: Number,
			default: 0,
		},

		productLikes: {
			type: Number,
			default: 0,
		},

		productComments: {
			type: Number,
			default: 0,
		},

		productRank: {
			type: Number,
			default: 0,
		},

		productImages: {
			type: [String],
			required: true,
		},

		productDescription: {
			type: String,
			default: '',
		},

		productBarter: {
			type: Boolean,
			default: false,
		},

		productRent: {
			type: Boolean,
			default: false,
		},

		productIsLimitedEdition: {
			type: Boolean,
			default: false,
		},

		productOrigin: {
			type: String
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		authorId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		soldAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'products' },
);

ProductSchema.index(
	{
		productCategory: 1,
		productLocation: 1,
		productTitle: 1,
		productPrice: 1,
	},
	{ unique: true },
);

export default ProductSchema;
