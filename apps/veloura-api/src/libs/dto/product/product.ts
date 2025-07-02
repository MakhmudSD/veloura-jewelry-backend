import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import {
	ProductMainCategory,
	ProductJewelrySubCategory,
	ProductStatus,
	ProductMaterial,
	ProductGender,
	ProductLocation,
} from '../../enums/product.enum';
import { Member, TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';

@ObjectType()
export class Product {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => ProductMainCategory)
	productMainCategory: ProductMainCategory;

	@Field(() => ProductJewelrySubCategory)
	productJewelrySubCategory: ProductJewelrySubCategory;

	@Field(() => ProductLocation, { nullable: true })
	productLocation: ProductLocation[];

	@Field(() => ProductStatus)
	productStatus: ProductStatus;

	@Field(() => ProductMaterial)
	productMaterial: ProductMaterial;

	@Field(() => ProductGender, { nullable: true })
	productGender?: ProductGender;

	@Field(() => String)
	productTitle: string;

	@Field(() => Number)
	productPrice: number;

	@Field(() => Number, {nullable: true})
	productSize: number;

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

	@Field(() => Boolean)
	productIsLimitedEdition: boolean;

	@Field(() => Boolean)
	productExchangeable: boolean;

	@Field(() => Boolean)
	productRentalAvailable: boolean;

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

	@Field(() => [MeLiked], {nullable: true})
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
