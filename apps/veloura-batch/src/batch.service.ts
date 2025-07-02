import { Injectable } from '@nestjs/common';
import { Member } from 'apps/veloura-api/src/libs/dto/member/member';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { MemberStatus, MemberType } from 'apps/veloura-api/src/libs/enums/member.enum';
import { Product, ProductStatus } from 'apps/veloura-api/src/libs/dto/product/product';

@Injectable()
export class BatchService {
	constructor(
		@InjectModel('Product') private readonly productModel: Model<Product>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
	) {}
	public getHello(): string {
		return 'Welcome to Veloura-jewelry BATCH Server!';
	}

	public async batchRollback(): Promise<void> {
		await this.productModel
			.updateMany(
				{
					productStatus: ProductStatus.AVAILABLE,
				},
				{ productRank: 0 },
			)
			.exec();

		await this.memberModel
			.updateMany(
				{
					memberStatus: MemberStatus.ACTIVE,
					memberType: MemberType.DESIGNER,
				},
				{ memberRank: 0 },
			)
			.exec();
	}

	public async batchTopProducts(): Promise<void> {
		const products: Product[] = await this.productModel
			.find({
				productStatus: ProductStatus.AVAILABLE,
				productRank: 0,
			})
			.exec();

		const promisedList = products.map(async (ele: Product) => {
			const { _id, productLikes, productViews } = ele;
			const rank = productLikes * 2 + productViews * 1;
			return await this.productModel.findByIdAndUpdate(_id, { productRank: rank });
		});
		await Promise.all(promisedList);
	}

	public async batchTopDesigners(): Promise<void> {
		const designers: Member[] = await this.memberModel
			.find({
				memberType: MemberType.DESIGNER,
				memberStatus: MemberStatus.ACTIVE,
				memberRank: 0,
			})
			.exec();

		const promisedList = designers.map(async (ele: Member) => {
			const { _id, memberProducts, memberLikes, memberArticles, memberViews } = ele;
			const rank =
				(memberProducts ?? 0) * 5 + (memberArticles ?? 0) * 3 + (memberLikes ?? 0) * 2 + (memberViews ?? 0) * 1;
			return await this.memberModel.findByIdAndUpdate(_id, { memberRank: rank });
		});
		await Promise.all(promisedList);
	}
}
