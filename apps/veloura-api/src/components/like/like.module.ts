import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeService } from './like.service';
import LikeSchema from '../../schemas/Like.model';
import { NotificationModule } from '../notification/notification.module';
import { ProductModule } from '../product/product.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Like',
				schema: LikeSchema,
			},
		]),
		ProductModule,
		NotificationModule,  // <-- add this
	],
    providers: [LikeService],
    exports: [LikeService]
})
export class LikeModule {}
