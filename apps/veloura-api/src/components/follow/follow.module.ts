import { Module } from '@nestjs/common';
import { FollowResolver } from './follow.resolver';
import { FollowService } from './follow.service';
import { MongooseModule } from '@nestjs/mongoose';
import FollowSchema from '../../schemas/Follow.model';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Follow',
				schema: FollowSchema,
			},
		]),
	],
	providers: [FollowResolver, FollowService],
})
export class FollowModule {}
