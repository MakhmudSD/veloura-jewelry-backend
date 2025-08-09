import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { View } from '../../libs/dto/views/view';
import { Model, ObjectId, Types } from 'mongoose';
import { ViewInput } from '../../libs/dto/views/view.input';
import { T } from '../../libs/types/common';
import { ViewGroup } from '../../libs/enums/view.enum';
import { OrdinaryInquiry } from '../../libs/dto/product/product.input';
import { Products } from '../../libs/dto/product/product';
import { lookupVisit } from '../../libs/config';

@Injectable()
export class ViewService {
	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

	public async recordView(input: ViewInput): Promise<View | null> {
		const newViewData = {
			...input,
			memberId: new Types.ObjectId(input.memberId as any),
			viewRefId: new Types.ObjectId(input.viewRefId as any),
		};
	
		const result = await this.viewModel.updateOne(
			{
				memberId: newViewData.memberId,
				viewRefId: newViewData.viewRefId,
				viewGroup: newViewData.viewGroup,
			},
			{ $setOnInsert: newViewData },
			{ upsert: true }
		);
	
		if (result.upsertedCount > 0) {
			console.log('- New View Insert -');
			return await this.viewModel.findOne({
				memberId: newViewData.memberId,
				viewRefId: newViewData.viewRefId,
				viewGroup: newViewData.viewGroup,
			});
		}
		return null;
	}
	

	// checkViewExistence
	public async checkViewExistence(input: ViewInput): Promise<View | null> {
		const { memberId, viewRefId } = input;
		const search: T = {
			memberId: memberId,
			viewRefId: viewRefId,
		};
		return await this.viewModel.findOne(search).exec();
	}

	// getVisitedProducts
	public async getVisitedProducts(memberId: ObjectId, input: OrdinaryInquiry): Promise<Products> {
		const { page, limit } = input;
		const match: T = { viewGroup: ViewGroup.PRODUCT, memberId: memberId };

		const data: T = await this.viewModel
			.aggregate([
				{ $match: match },
				{ $sort: { updatedAt: -1 } },
				{
					$lookup: {
						from: 'products',
						localField: 'viewRefId',
						foreignField: '_id',
						as: 'visitedProduct',
					},
				},
				{ $unwind: '$visitedProduct' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupVisit,
							{ $unwind: '$visitedProduct.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		console.log('data:', data);
		const result: Products = { list: [], metaCounter: data[0].metaCounter };
		result.list = data[0].list.map((ele) => ele.visitedProduct);
		return result;
	}
}
