import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeService } from './like.service';
import LikeSchema from '../../schemas/Like.model';
import { NotificationModule } from '../notification/notification.module';
import { ProductModule } from '../product/product.module';
import ProductSchema from '../../schemas/Product.model';
import MemberSchema from '../../schemas/Member.model';
import { BoardArticle } from '../../libs/dto/board-article/board-article';
import { BoardArticleModule } from '../board-article/board-article.module';
import BoardArticleSchema from '../../schemas/BoardArticle.model';

@Module({
	imports: [
	  MongooseModule.forFeature([
		{ name: 'Like', schema: LikeSchema },
		{ name: 'Product', schema: ProductSchema }, 
		{ name: 'BoardArticle', schema: BoardArticleSchema },
		{ name: 'Member', schema: MemberSchema },
	  ]),
	  NotificationModule,

	],
	providers: [LikeService],
	exports: [LikeService],
  })
  export class LikeModule {}
  