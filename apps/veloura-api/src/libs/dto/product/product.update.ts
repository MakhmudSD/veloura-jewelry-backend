import { InputType, Field, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length, IsInt, Min, IsBoolean } from 'class-validator';
import { ObjectId } from 'mongoose';
import {
	ProductStatus,
	ProductMaterial,
	ProductGender,
	ProductLocation,
	ProductCategory,
} from '../../enums/product.enum';

@InputType()
export class ProductUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => ProductCategory, { nullable: true })
	productCategory?: ProductCategory;

	@IsOptional()
	@Field(() => String, { nullable: true })
	productBrand?: string;

	@IsOptional()
	@Field(() => ProductLocation, { nullable: true })
	productLocation?: ProductLocation;

	@IsOptional()
	@Field(() => String, { nullable: true })
	productAddress?: string;

	@IsOptional()
	@Field(() => ProductStatus, { nullable: true })
	productStatus?: ProductStatus;

	@IsOptional()
	@Field(() => String, { nullable: true })
	productOrigin?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	productColor?: string;

	@IsOptional()
	@Field(() => ProductMaterial, { nullable: true })
	productMaterial?: ProductMaterial;

	@IsOptional()
	@Field(() => ProductGender, { nullable: true })
	productGender?: ProductGender;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	productTitle?: string;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	productPrice?: number;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	productSize?: Number;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Field(() => Int, { nullable: true })
	productStock?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	productImages?: string[];

	@IsOptional()
	@Field(() => String, { nullable: true })
	productDesc?: string;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	productWeightUnit?: Number;

	@IsOptional()
	@IsBoolean()
	@Field(() => Boolean, { nullable: true })
	productBarter?: boolean;

	@IsOptional()
	@IsBoolean()
	@Field(() => Boolean, { nullable: true })
	productLimited?: boolean;

	@IsOptional()
	@IsBoolean()
	@Field(() => Boolean, { nullable: true })
	productRent?: boolean;

	soldAt?: Date;

	deletedAt?: Date;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	constructedAt?: Date;
}
