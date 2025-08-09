import { AuthModule } from './../auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoticeResolver } from './notice.resolver';
import { NoticeService } from './notice.service';
import NoticeSchema from '../../schemas/Notice.model'; // Adjust path to your NoticeSchema
import { MemberModule } from '../member/member.module';
import { LikeModule } from '../like/like.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Notice', schema: NoticeSchema }]),
		AuthModule,
		forwardRef(() => MemberModule), // only if needed
	],
	providers: [NoticeResolver, NoticeService],
	exports: [NoticeService],
})
export class NoticeModule {}