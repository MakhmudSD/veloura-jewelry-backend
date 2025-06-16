import { AuthService } from './../auth/auth.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ViewService } from '../view/views.service';
import { MemberService } from '../member/member.service';
import { PropertyInput } from '../../libs/dto/property/property.update';
import { Message } from '../../libs/enums/common.enum';
import { Property } from '../../libs/dto/property/property';
import { Model } from 'mongoose';

@Injectable()
export class PropertyService {
	constructor(
		@InjectModel('Property') private readonly propertyModel: Model<Property | null>,
		private memberService: MemberService,
		private viewService: ViewService,
	) {}

	public async createProperty(input: PropertyInput): Promise<Property> {
		try {
			const result = await this.propertyModel.create(input);
			await this.memberService.memberStatsEditor({ _id: result.memberId, targetKey: 'memberProperties', modifier: 1 });
			return result;
		} catch (err) {
			console.log('ERROR on service Model of signup', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}
}
