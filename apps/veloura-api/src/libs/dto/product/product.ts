import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import {
  ProductMainCategory,
  ProductJewelrySubCategory,
  ProductStatus,
  ProductMaterial,
  ProductGender,
  ProductLocation
} from '../../enums/product.enum';
import { Member, TotalCounter } from '../member/member';

@ObjectType()
export class Product {
  @Field(() => String)
  _id: ObjectId;

  @Field(() => ProductMainCategory)
  productMainCategory: ProductMainCategory;

  @Field(() => ProductJewelrySubCategory, { nullable: true })
  productJewelrySubCategory?: ProductJewelrySubCategory;

  @Field(() => [ProductLocation], { nullable: true })
productLocationList?: ProductLocation[];

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

  @Field(() => String, { nullable: true })
  productSize?: string;

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

  @Field(() => [String])
  productImages: string[];

  @Field(() => String, { nullable: true })
  productDesc?: string;

  @Field(() => Boolean)
  productIsLimitedEdition: boolean;

  @Field(() => Boolean)
  productExchangeable: boolean;


  @Field(() => Boolean)
  productRentalAvailable: boolean;


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
}

@ObjectType()
export class Products {
  @Field(() => [Product])
  list: Product[];

  @Field(() => [TotalCounter], { nullable: true })
  metaCounter?: TotalCounter[];
}
