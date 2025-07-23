import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import {
	ProductStatus,
	ProductMaterial,
	ProductGender,
	ProductLocation,
	ProductCategory,
} from '../../enums/product.enum';
import { Member, TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';

@ObjectType()
export class Product {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => ProductCategory)
	productCategory: ProductCategory;

	@Field(() => String, { nullable: true })
	productBrand?: string; // ✅ NEW FIELD

	@Field(() => ProductLocation, { nullable: true })
	productLocation: ProductLocation[];

	@Field(() => ProductStatus)
	productStatus: ProductStatus;

	@Field(() => String, {nullable: true})
	productOrigin?: string;

	@Field(() => String, {nullable: true})
	productColor?: string;

	@Field(() => ProductMaterial)
	productMaterial: ProductMaterial;

	@Field(() => ProductGender, { nullable: true })
	productGender?: ProductGender;

	@Field(() => String)
	productTitle: string;

	@Field(() => String, { nullable: true })
	productAddress?: string;

	@Field(() => Number, { nullable: true })
	productPrice?: number;

	@Field(() => Number, { nullable: true })
	productSize?: number;

	@Field(() => Int)
	productStock: number;

	@Field(() => Int)
	productViews: number;

	@Field(() => Int)
	productLikes: number;

	@Field(() => Int)
	productComments: number;

	@Field(() => Int)
	productRank: number;

	@Field(() => String, { nullable: true })
	productDesc?: string;

	@Field(() => Number, { nullable: true})
	productWeightUnit?: number;

	@Field(() => Boolean)
	productBarter: boolean;

	@Field(() => Boolean)
	productRent: boolean;

	@Field(() => [String])
	productImages: string[];

	@Field(() => String)
	authorId: ObjectId;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => Date, { nullable: true })
	soldAt?: Date;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	@Field(() => Member, { nullable: true })
	memberData?: Member;

	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];
}

@ObjectType()
export class Products {
	@Field(() => [Product])
	list: Product[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter?: TotalCounter[];
}

export { ProductStatus };
