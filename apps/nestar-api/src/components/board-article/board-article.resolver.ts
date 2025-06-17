import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { BoardArticleService } from './board-article.service';
import { AuthGuard } from '../auth/guards/auth.guard';
import { UseGuards } from '@nestjs/common';
import { BoardArticle, BoardArticles } from '../../libs/dto/board-article/board-article';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import {
	AllBoardArticlesInquiry,
	BoardArticleInput,
	BoardArticlesInquiry,
} from '../../libs/dto/board-article/board-article.input';
import { ObjectId } from 'mongoose';
import { Query } from '@nestjs/graphql';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { WithoutGuard } from '../auth/guards/without.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { BoardArticleUpdate } from '../../libs/dto/board-article/board-article.update';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';

@Resolver()
export class BoardArticleResolver {
	constructor(private readonly boardArticleService: BoardArticleService) {}

	@UseGuards(AuthGuard)
	@Mutation(() => BoardArticle)
	public async createBoardArticle(
		@Args('input') input: BoardArticleInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<BoardArticle> {
		console.log('Mutation: createBoardArticle');
		input.memberId = memberId; // not coming from frontend, exists only in backend
		return await this.boardArticleService.createBoardArticle(input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => BoardArticle)
	public async getBoardArticle(
		@Args('propertyId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<BoardArticle> {
		console.log('Query: getBoardArticle');
		const articleId = shapeIntoMongoObjectId(input);
		return await this.boardArticleService.getBoardArticle(memberId, articleId);
	}
}
