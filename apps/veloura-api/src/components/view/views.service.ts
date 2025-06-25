import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { View } from '../../libs/dto/views/view';
import { Model, Types } from 'mongoose';
import { ViewInput } from '../../libs/dto/views/view.input';
import { T } from '../../libs/types/common';

@Injectable()
export class ViewService {
	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

	public async recordView(input: ViewInput): Promise<View | null> {
		const viewExist = await this.checkViewExistence(input);
		if (!viewExist) {
			console.log('- New View Insert -');
			const newViewData = {
				...input,
				memberId: new Types.ObjectId(input.memberId as any),
				viewRefId: new Types.ObjectId(input.viewRefId as any),
			};
			return await this.viewModel.create(newViewData);
		}
		return null;
	}

	public async checkViewExistence(input: ViewInput): Promise<View | null> {
		const { memberId, viewRefId } = input;
		const search: T = {
			memberId: memberId,
			viewRefId: viewRefId,
		};
		return await this.viewModel.findOne(search).exec();
	}
}
