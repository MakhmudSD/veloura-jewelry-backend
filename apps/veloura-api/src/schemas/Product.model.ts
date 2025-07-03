import { Schema } from 'mongoose';
import {
	ProductMainCategory,
	ProductJewelrySubCategory,
	ProductStatus,
	ProductMaterial,
	ProductGender,
	ProductLocation,
} from '../libs/enums/product.enum';

const ProductSchema = new Schema(
	{
		productMainCategory: {
			type: String,
			enum: ProductMainCategory,
			default: ProductMainCategory.JEWELRY,
			required: true,
		},

		productJewelrySubCategory: {
			type: String,
			enum: ProductJewelrySubCategory,
			required: true,
			default: ProductJewelrySubCategory.RING,
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

		productExchangeable: {
			type: Boolean,
			default: false,
		},

		productRentalAvailable: {
			type: Boolean,
			default: false,
		},

		productIsLimitedEdition: {
			type: Boolean,
			default: false,
		},

		productOriginLabel: {
			type: String, // e.g., "Made in Switzerland"
			default: '',
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
	  productMainCategory: 1, 
	  productJewelrySubCategory: 1,   // ✅ fixed spelling!
	  productLocation: 1, 
	  productTitle: 1, 
	  productPrice: 1 
	},
	{ unique: true },
  );

export default ProductSchema;
