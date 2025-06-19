import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { MemberService } from '../member/member.service';
import { BoardArticleService } from '../board-article/board-article.service';
import { CommentInput } from '../../libs/dto/comment/comment.input';
import { Message } from '../../libs/enums/common.enum';
import { CommentGroup } from '../../libs/enums/comment.enum';
import { PropertyService } from '../property/property.service';
import { Comments, Comment } from '../../libs/dto/comment/comment';

@Injectable()
export class CommentService {
	constructor(
		@InjectModel('Comment') private readonly commentModel: Model<Comment | null>,
		private memberService: MemberService,
		private propertyService: PropertyService,
		private boardArticleService: BoardArticleService,
	) {}

	public async createComment(memberId: ObjectId, input: CommentInput): Promise<Comment> {
		input.memberId = memberId;
		let result: Comment | null = null;
		try {
			result = await this.commentModel.create(input);
		} catch (err) {
			console.log('ERROR on service Model of createComment', err.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}

		switch (input.commentGroup) {
			case CommentGroup.PROPERTY:
				await this.propertyService.propertyStatsEditor({
					_id: input.commentRefId,
					targetKey: 'propertyComments',
					modifier: 1,
				});
				break;
		}

		switch (input.commentGroup) {
			case CommentGroup.ARTICLE:
				await this.boardArticleService.boardArticleStatsEditor({
					_id: input.commentRefId,
					targetKey: 'articleComments',
					modifier: 1,
				});
				break;
		}

		switch (input.commentGroup) {
			case CommentGroup.MEMBER:
				await this.memberService.memberStatsEditor({
					_id: input.commentRefId,
					targetKey: 'memberComments',
					modifier: 1,
				});
				break;
		}

		if (!result) throw new InternalServerErrorException(Message.CREATE_FAILED);
		return result;
	}
}
