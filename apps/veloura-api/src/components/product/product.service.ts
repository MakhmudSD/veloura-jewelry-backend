import { ViewGroup } from '../../libs/enums/view.enum';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ViewService } from '../view/views.service';
import { MemberService } from '../member/member.service';
import { ProductStatus } from '../../libs/dto/product/product';
import { Direction, Message } from '../../libs/enums/common.enum';
import { Products, Product } from '../../libs/dto/product/product';
import { Model, ObjectId } from 'mongoose';
import { StatisticModifier, T } from '../../libs/types/common';
import { ProductUpdate } from '../../libs/dto/product/product.input';
import * as moment from 'moment';
import { lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import {
	ProductInput,
	ProductsInquiry,
	DesignerProductsInquiry,
	AllProductsInquiry,
} from '../../libs/dto/product/product.update';

@Injectable()
export class ProductService {
	constructor(
		@InjectModel('Product') private readonly productModel: Model<Product | null>,
		private memberService: MemberService,
		private viewService: ViewService,
	) {}

	public async createProduct(input: ProductInput): Promise<Product> {
		try {
			const result: any = await this.productModel.create(input);
			await this.memberService.memberStatsEditor({ _id: result.memberId, targetKey: 'memberProducts', modifier: 1 });
			return result;
		} catch (err) {
			console.log('ERROR on service Model of createProduct', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getProduct(memberId: ObjectId, productId: ObjectId): Promise<Product> {
		const search: T = {
			_id: productId,
			productStatus: ProductStatus.AVAILABLE,
		};

		const targetProduct: Product | null = await this.productModel.findOne(search).lean().exec();
		if (!targetProduct) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId: memberId, viewRefId: productId, viewGroup: ViewGroup.PRODUCT };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.productStatsEditor({ _id: productId, targetKey: 'productViews', modifier: 1 });
				targetProduct.productViews++;
			}
		}

		targetProduct.memberData = await this.memberService.getMember(null, targetProduct.memberId);
		return targetProduct;
	}

	public async updateProduct(memberId: ObjectId, input: ProductUpdate): Promise<Product> {
		const { productStatus } = input;
		if (productStatus === ProductStatus.SOLD) {
			input.soldAt = moment().toDate();
		}

		if (productStatus === ProductStatus.DELETE) {
			input.deletedAt = moment().toDate();
		}

		const search: T = {
			_id: input._id,
			memberId: memberId,
		};

		const result = await this.productModel.findOneAndUpdate(search, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (input.soldAt || input.deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: memberId,
				targetKey: 'memberProducts',
				modifier: -1,
			});
		}

		return result;
	}

	public async getProducts(memberId: ObjectId, input: ProductsInquiry): Promise<Products> {
		const match: T = { productStatus: ProductStatus.AVAILABLE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		this.shapeMatchQuery(match, input);
		console.log('match:', match);

		const result = await this.productModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							// meLiked
							lookupMember,
							{ $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async getDesignerProducts(memberId: ObjectId, input: DesignerProductsInquiry): Promise<Products> {
		const { productStatus } = input.search;
		if (productStatus === ProductStatus.DELETE) throw new InternalServerErrorException(Message.NOT_ALLOWED_REQUEST);

		const match: T = { memberId: memberId, productStatus: productStatus ?? { $ne: ProductStatus.DELETE } };

		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const result = await this.productModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							// meLiked
							lookupMember,
							{ $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	/** ADMIN **/

	public async getAllProductsByAdmin(memberId: ObjectId, input: AllProductsInquiry): Promise<Products> {
		const { productStatus, productLocationList } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (productStatus) match.productStatus = productStatus;
		if (productLocationList) match.productLocation = productLocationList;
		const result = await this.productModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							// meLiked
							lookupMember,
							{ $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	public async updateProductByAdmin(input: ProductUpdate): Promise<Product> {
		let { productStatus, soldAt, deletedAt } = input;

		const search: T = {
			_id: input._id,
			productStatus: ProductStatus.AVAILABLE,
		};

		if (productStatus === ProductStatus.SOLD) {
			input.soldAt = moment().toDate();
		}
		if (productStatus === ProductStatus.DELETE) {
			input.deletedAt = moment().toDate();
		}

		const result = await this.productModel.findOneAndUpdate(search, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (soldAt || deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberProducts',
				modifier: -1,
			});
		}

		return result;
	}

	public async removeProductByAdmin(productId: ObjectId): Promise<Product> {
		const search: T = {
			_id: productId,
			productStatus: ProductStatus.DELETE,
		};
		const result = await this.productModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	/** PRIVATES **/
	private shapeMatchQuery(match: T, input: ProductsInquiry): void {
		const search = input.search;
		if (!search) return;

		const {
			memberId,
			locationList,
			categoryList, // productMainCategory
			pricesRange,
			dateRange,
			options,
			text,
		} = input.search;

		if (memberId) {
			match.memberId = shapeIntoMongoObjectId(memberId);
		}

		if (locationList) {
			match.productLocation = { $in: locationList };
		}

		if (categoryList) {
			match.productMainCategory = { $in: categoryList };
		}

		if (pricesRange) {
			match.productPrice = {
				$gte: pricesRange.start,
				$lte: pricesRange.end,
			};
		}

		if (dateRange) {
			match.createdAt = {
				$gte: dateRange.start,
				$lte: dateRange.end,
			};
		}

		if (text) {
			match.productTitle = {
				$regex: new RegExp(text, 'i'),
			};
		}

		if (options) {
			match['$or'] = options.map((key) => ({ [key]: true }));
		}
	}

	public async productStatsEditor(input: StatisticModifier): Promise<Product | null> {
		const { _id, targetKey, modifier } = input;
		const updated = await this.productModel
			.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true })
			.lean()
			.exec();

		return updated as Product | null;
	}
}
