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
import { Products } from '../../libs/dto/product/product';
import { NotificationService } from '../notification/notification.service'; // import NotificationService
import { NotificationType, NotificationGroup } from '../../libs/enums/notification.enum';
import { ProductService } from '../product/product.service';

@Injectable()
export class LikeService {
	constructor(
		@InjectModel('Like') private readonly likeModel: Model<Like>,
		private readonly productService: ProductService,
		private readonly notificationService: NotificationService, // inject NotificationService
	) {}

	// toggleLike
	public async toggleLike(input: LikeInput): Promise<number> {
		const search: T = { memberId: input.memberId, likeRefId: input.likeRefId },
			exist = await this.likeModel.findOne(search).exec();
		let modifier = 1;

		if (exist) {
			await this.likeModel.findOneAndDelete(search).exec();
			modifier = -1;
		} else {
			try {
				await this.likeModel.create(input);

				// ---- NOTIFICATION CREATION START ----
				// Create notification ONLY when a like is added (modifier = 1)
				await this.notificationService.createNotification({
					notificationType: NotificationType.LIKE,
					notificationGroup: this.mapLikeGroupToNotificationGroup(input.likeGroup),
					notificationTitle: 'Someone liked your content',
					notificationDesc: `User ${input.memberId} liked your ${input.likeGroup.toLowerCase()}`,
					authorId: input.memberId,
					receiverId: await this.getOwnerIdForLike(input), // function to get content owner ID
					productId: input.likeGroup === LikeGroup.PRODUCT ? input.likeRefId : undefined,
					// you can add articleId or commentId here similarly if needed
				});
				// ---- NOTIFICATION CREATION END ----
			} catch (err) {
				console.log('ERROR on service model of toggleLike', err.message);
				throw new BadRequestException(Message.CREATE_FAILED);
			}
		}
		console.log(`- Like Modifier ${modifier} -`);
		return modifier;
	}

	// Helper to map LikeGroup to NotificationGroup
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
		// Determine who owns the thing being liked.
		switch (input.likeGroup) {
			case LikeGroup.MEMBER:
				return input.likeRefId; // when you like a member, that member is the owner
			case LikeGroup.PRODUCT:
				const product = await this.productService.getProduct(null, input.likeRefId);
				return product.authorId; // adjust to your schema
			// Add other groups...
			default:
				throw new BadRequestException('Unsupported like group');
		}
	}

	// ...existing methods below unchanged...
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
