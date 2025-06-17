import { MemberService } from './../member/member.service';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { BoardArticle, BoardArticles } from '../../libs/dto/board-article/board-article';
import {
	AllBoardArticlesInquiry,
	BoardArticleInput,
	BoardArticlesInquiry,
} from '../../libs/dto/board-article/board-article.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { BoardArticleStatus } from '../../libs/enums/board-article.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { BoardArticleUpdate } from '../../libs/dto/board-article/board-article.update';
import { lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { ViewService } from '../view/views.service';

@Injectable()
export class BoardArticleService {
	constructor(
		@InjectModel('BoardArticle') private readonly boardArticleModel: Model<BoardArticle | null>,
		private memberService: MemberService,
		private viewService: ViewService,
	) {}

	public async createBoardArticle(input: BoardArticleInput): Promise<BoardArticle> {
		try {
			const result: any = await this.boardArticleModel.create(input);
			await this.memberService.memberStatsEditor({ _id: result.memberId, targetKey: 'memberArticles', modifier: 1 });
			return result;
		} catch (err) {
			console.log('ERROR on service Model of createBoardArticle', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}
}
