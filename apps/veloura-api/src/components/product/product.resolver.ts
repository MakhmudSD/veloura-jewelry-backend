import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { ProductService } from './product.service';
import { Products, Product } from '../../libs/dto/product/product';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { Query } from '@nestjs/graphql';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import {
	DesignerProductsInquiry,
	AllProductsInquiry,
	ProductsInquiry,
	ProductInput,
} from '../../libs/dto/product/product.input';
import { ProductUpdate } from '../../libs/dto/product/product.update';

@Resolver()
export class ProductResolver {
	constructor(private readonly productService: ProductService) {}

	@Roles(MemberType.DESIGNER)
	@UseGuards(RolesGuard)
	@Mutation(() => Product)
	public async createProduct(
		@Args('input') input: ProductInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Product> {
		console.log('Mutation: createProduct');
		input.memberId = memberId; // not coming from frontend, exists only in backend
		return await this.productService.createProduct(input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Product)
	public async getProduct(
		@Args('productId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Product> {
		console.log('Query: getProduct');
		const productId = shapeIntoMongoObjectId(input);
		return await this.productService.getProduct(memberId, productId);
	}

	@Roles(MemberType.DESIGNER)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Product)
	public async updateProduct(
		@Args('input') input: ProductUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Product> {
		console.log('@Mutation: updateProduct');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.productService.updateProduct(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Products)
	public async getProducts(
		@Args('input') input: ProductsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Products> {
		console.log('Query: getProducts');
		return await this.productService.getProducts(memberId, input);
	}

	@Roles(MemberType.DESIGNER)
	@UseGuards(RolesGuard)
	@Query((returns) => Products)
	public async getDesignerProducts(
		@Args('input') input: DesignerProductsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Products> {
		console.log('Query: getDesignerProducts', input);
		return await this.productService.getDesignerProducts(memberId, input);
	}

	/** ADMIN **/
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query((returns) => Products)
	public async getAllProductsByAdmin(
		@Args('input') input: AllProductsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Products> {
		console.log('Query: getAllProductsByAdmin', input);
		return await this.productService.getAllProductsByAdmin(memberId, input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Product)
	public async updateProductByAdmin(@Args('input') input: ProductUpdate): Promise<Product> {
		console.log('Query: updateProductByAdmin', input);
		return await this.productService.updateProductByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Product)
	public async removeProductByAdmin(@Args('productId') input: string): Promise<Product> {
		console.log('Query: removeProductByAdmin', input);
		const productId = shapeIntoMongoObjectId(input);
		return await this.productService.removeProductByAdmin(productId);
	}
}
