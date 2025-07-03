import { Comment } from './../../libs/dto/comment/comment';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Like, MeLiked } from '../../libs/dto/like/like';
import { LikeInput } from '../../libs/dto/like/like.input';
import { T } from '../../libs/types/common';
import { Message } from '../../libs/enums/common.enum';
import { OrdinaryInquiry } from '../../libs/dto/product/product.input';
import { LikeGroup } from '../../libs/enums/like.enum';
import { lookupFavorite } from '../../libs/config';
import { Product, Products } from '../../libs/dto/product/product';
import { NotificationService } from '../notification/notification.service'; // import NotificationService
import { NotificationType, NotificationGroup } from '../../libs/enums/notification.enum';
import { Member } from '../../libs/dto/member/member';
import { BoardArticle } from '../../libs/dto/board-article/board-article';

@Injectable()
export class LikeService {
	constructor(
		@InjectModel('Like') private readonly likeModel: Model<Like>,
		@InjectModel('Product') private readonly productModel: Model<Product>,
		@InjectModel('BoardArticle') private readonly articleModel: Model<BoardArticle>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		@InjectModel('Member') private readonly commentModel: Model<Comment>,
		private readonly notificationService: NotificationService,
	) {}

	public async toggleLike(input: LikeInput): Promise<number> {
		const search: T = { memberId: input.memberId, likeRefId: input.likeRefId };
		const exist = await this.likeModel.findOne(search).exec();
		let modifier = 1;

		if (exist) {
			// Unlike: delete existing like
			await this.likeModel.findOneAndDelete(search).exec();
			modifier = -1;
		} else {
			try {
				// Create the like first
				await this.likeModel.create(input);

				// Fetch memberNick for notification message
				const member = await this.memberModel.findById(input.memberId).exec();
				const memberNick = member?.memberNick || 'Someone';

				// Determine notification title and description based on likeGroup
				let notificationTitle = '';
				let notificationDesc = '';

				switch (input.likeGroup) {
					case LikeGroup.PRODUCT: {
						const product = await this.productModel.findById(input.likeRefId).exec();
						const productName = product?.productTitle || 'your product';
						notificationTitle = `${memberNick} liked your product`;
						notificationDesc = `${memberNick} liked your product '${productName}'`;
						break;
					}
					case LikeGroup.ARTICLE: {
						const article = await this.articleModel.findById(input.likeRefId).exec();
						const articleTitle = article?.articleTitle || 'your article';
						notificationTitle = `${memberNick} liked your article`;
						notificationDesc = `${memberNick} liked your article titled '${articleTitle}'`;
						break;
					}
					case LikeGroup.COMMENT: {
						const comment = await this.commentModel.findById(input.likeRefId).exec();
						const commentContent = comment?.commentContent || 'your comment';
						notificationTitle = `${memberNick} liked your comment`;
						notificationDesc = `${memberNick} liked your comment titled '${commentContent}'`;
						break;
					}
					case LikeGroup.MEMBER: {
						notificationTitle = `${memberNick} liked your profile`;
						notificationDesc = `${memberNick} liked your profile on ${new Date().toLocaleDateString()}`;
						break;
					}
					default: {
						notificationTitle = `${memberNick} liked your content`;
						notificationDesc = `${memberNick} liked your content on ${new Date().toLocaleDateString()}`;
					}
				}

				// Get the notification receiver (owner of the liked entity)
				const receiverId = await this.getOwnerIdForLike(input);
				if (!receiverId) {
					console.warn('No receiverId found for like notification, skipping notification creation');
				} else if (receiverId.toString() === input.memberId.toString()) {
					// Optional: prevent notifying user about liking their own content
					console.log('User liked their own content, skipping notification');
				} else {
					console.log('Creating notification for receiverId:', receiverId.toString());

					await this.notificationService.createNotification({
						notificationType: NotificationType.LIKE,
						notificationGroup: this.mapLikeGroupToNotificationGroup(input.likeGroup),
						notificationTitle,
						notificationDesc,
						authorId: input.memberId,
						receiverId,
						productId: input.likeGroup === LikeGroup.PRODUCT ? input.likeRefId : undefined,
						// Add articleId, commentId if applicable
					});
				}
			} catch (err) {
				console.error('ERROR on toggleLike:', err);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}
		console.log(`- Like Modifier ${modifier} -`);
		return modifier;
	}

	private mapLikeGroupToNotificationGroup(likeGroup: LikeGroup): NotificationGroup {
		switch (likeGroup) {
			case LikeGroup.PRODUCT:
				return NotificationGroup.PRODUCT;
			case LikeGroup.ARTICLE:
				return NotificationGroup.ARTICLE;
			case LikeGroup.MEMBER:
				return NotificationGroup.MEMBER;
			default:
				return NotificationGroup.MEMBER;
		}
	}

	private async getOwnerIdForLike(input: LikeInput): Promise<ObjectId> {
		switch (input.likeGroup) {
			case LikeGroup.MEMBER:
				return input.likeRefId; // member is owner
			case LikeGroup.PRODUCT: {
				const product = await this.productModel.findById(input.likeRefId).exec();
				if (!product) throw new BadRequestException(`Product not found: ${input.likeRefId}`);
				return product.authorId;
			}
			case LikeGroup.ARTICLE: {
				const article = await this.articleModel.findById(input.likeRefId).exec();
				if (!article) throw new BadRequestException(`Article not found: ${input.likeRefId}`);
				return article.authorId;
			}
			default:
				throw new BadRequestException(`Unsupported like group: ${input.likeGroup}`);
		}
	}

	public async checkLikeExistence(input: LikeInput): Promise<MeLiked[]> {
		const { memberId, likeRefId } = input;
		const result = await this.likeModel.findOne({ memberId: memberId, likeRefId: likeRefId }).exec();
		return result ? [{ memberId: memberId, likeRefId: likeRefId, myFavorite: true }] : [];
	}

	public async getFavoriteProducts(memberId: ObjectId, input: OrdinaryInquiry): Promise<Products> {
		const { page, limit } = input;
		const match: T = { likeGroup: LikeGroup.PRODUCT, memberId: memberId };

		const data: T = await this.likeModel
			.aggregate([
				{ $match: match },
				{ $sort: { updatedAt: -1 } },
				{
					$lookup: {
						from: 'products',
						localField: 'likeRefId',
						foreignField: '_id',
						as: 'favoriteProduct',
					},
				},
				{ $unwind: '$favoriteProduct' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupFavorite,
							{ $unwind: '$favoriteProduct.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		console.log('data:', data);
		const result: Products = { list: [], metaCounter: data[0].metaCounter };
		result.list = data[0].list.map((ele) => ele.favoriteProduct);
		return result;
	}
}
