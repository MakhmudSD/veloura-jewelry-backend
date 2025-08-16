import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId, Types } from 'mongoose';
import { MemberService } from '../member/member.service';
import { BoardArticleService } from '../board-article/board-article.service';
import { ProductService } from '../product/product.service';
import { NotificationService } from '../notification/notification.service';
import { CommentInput, CommentsInquiry } from '../../libs/dto/comment/comment.input';
import { Direction, Message } from '../../libs/enums/common.enum';
import { CommentGroup, CommentStatus } from '../../libs/enums/comment.enum';
import { Comments, Comment } from '../../libs/dto/comment/comment';
import { CommentUpdate } from '../../libs/dto/comment/comment.update';
import { StatisticModifier, T } from '../../libs/types/common';
import { lookupMember } from '../../libs/config';
import { NotificationGroup, NotificationType } from '../../libs/enums/notification.enum';

@Injectable()
export class CommentService {
	constructor(
		@InjectModel('Comment') private readonly commentModel: Model<Comment | null>,
		private readonly memberService: MemberService,
		private readonly productService: ProductService,
		private readonly boardArticleService: BoardArticleService,
		private readonly notificationService: NotificationService,
	) {}

	// createComment
	public async createComment(memberId: ObjectId, input: CommentInput): Promise<Comment> {
		input.memberId = memberId;

		let result: Comment | null = null;

		try {
			result = await this.commentModel.create(input);
		} catch (err) {
			console.log('ERROR on service Model of createComment', err?.message);
			throw new BadRequestException(Message.CREATE_FAILED);
		}

		try {
			let receiverId: ObjectId | undefined;

			if (input.parentId && Types.ObjectId.isValid(String(input.parentId))) {
				const parentComment = await this.commentModel.findById(input.parentId).lean();
				receiverId = parentComment?.memberId as any;
			} else {
				switch (input.commentGroup) {
					case CommentGroup.PRODUCT: {
						const product = await this.productService.findById(input.commentRefId);
						receiverId = (product as any)?.memberId || (product as any)?.ownerId || (product as any)?.authorId;
						break;
					}
					case CommentGroup.ARTICLE: {
						const article = await this.boardArticleService.findById(input.commentRefId);
						receiverId = (article as any)?.authorId;
						break;
					}
					case CommentGroup.MEMBER: {
						receiverId = input.commentRefId as any;
						break;
					}
				}
			}

			const sameUser = receiverId && String(receiverId) === String(memberId);

			if (receiverId && !sameUser) {
				await this.notificationService.notify({
					receiverId,
					authorId: memberId,
					type: NotificationType.COMMENT,
					group: this.mapCommentGroupToNotificationGroup(input.commentGroup),
					title: input.parentId ? 'New reply on your comment' : 'New comment',
					desc: (input.commentContent || '').trim(),
					productId: input.commentGroup === CommentGroup.PRODUCT ? (input.commentRefId as any) : undefined,
					articleId: input.commentGroup === CommentGroup.ARTICLE ? (input.commentRefId as any) : undefined,
					commentId: result!._id as any,
					refId: result!._id as any,
				});
			}
		} catch (err) {
			console.error('Failed to create notification for comment:', err);
		}

		// ---- Stats updates ----
		switch (input.commentGroup) {
			case CommentGroup.PRODUCT:
				await this.productService.productStatsEditor({
					_id: input.commentRefId,
					targetKey: 'productComments',
					modifier: 1,
				});
				break;

			case CommentGroup.ARTICLE:
				await this.boardArticleService.boardArticleStatsEditor({
					_id: input.commentRefId,
					targetKey: 'articleComments',
					modifier: 1,
				});
				break;

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

	// updateComment
	public async updateComment(memberId: ObjectId, input: CommentUpdate): Promise<Comment> {
		const { _id } = input;
		const result = await this.commentModel.findOneAndUpdate(
			{ _id, memberId: memberId, commentStatus: CommentStatus.ACTIVE },
			input,
			{ new: true },
		);
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);
		return result;
	}

	// getComments
	public async getComments(memberId: ObjectId, input: CommentsInquiry): Promise<Comments> {
		const { commentRefId } = input.search;
		const match: T = { commentRefId: commentRefId, commentStatus: CommentStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const result = await this.commentModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: { path: '$memberData', preserveNullAndEmptyArrays: true } },
							{
								$lookup: {
									from: 'comments',
									localField: '_id',
									foreignField: 'parentId',
									as: 'replies',
								},
							},
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	// removeCommentByUser
	public async removeCommentByUser(memberId: ObjectId, commentId: ObjectId): Promise<Comment> {
		const result = await this.commentModel.findOneAndUpdate(
			{ _id: commentId, memberId: memberId, commentStatus: CommentStatus.ACTIVE },
			{ commentStatus: CommentStatus.DELETE },
			{ new: true },
		);

		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		await this.commentModel.updateMany(
			{ parentId: commentId, commentStatus: CommentStatus.ACTIVE },
			{ commentStatus: CommentStatus.DELETE },
		);

		return result;
	}

	/** ADMIN */

	// removeCommentByAdmin
	public async removeCommentByAdmin(commentId: ObjectId): Promise<Comment> {
		const search: T = { _id: commentId, commentStatus: CommentStatus.DELETE };
		const result = await this.commentModel.findOneAndDelete(search).exec();
		await this.commentModel.updateMany({ parentId: commentId }, { commentStatus: CommentStatus.DELETE });
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);
		return result;
	}

	// commentStatsEditor
	public async commentStatsEditor(input: StatisticModifier): Promise<Comment | null> {
		const { _id, targetKey, modifier } = input;
		const updated = await this.commentModel
			.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true })
			.lean()
			.exec();

		return updated as Comment | null;
	}

	// ---- helpers ----
	private mapCommentGroupToNotificationGroup(group: CommentGroup): NotificationGroup {
		switch (group) {
			case CommentGroup.PRODUCT:
				return NotificationGroup.PRODUCT;
			case CommentGroup.ARTICLE:
				return NotificationGroup.ARTICLE;
			case CommentGroup.MEMBER:
				return NotificationGroup.MEMBER;
			default:
				return NotificationGroup.COMMENT;
		}
	}
}
