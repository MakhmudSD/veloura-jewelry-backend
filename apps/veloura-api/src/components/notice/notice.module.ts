import { AuthModule } from './../auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoticeResolver } from './notice.resolver';
import { NoticeService } from './notice.service';
import NoticeSchema from '../../schemas/Notice.model';
import { MemberModule } from '../member/member.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Notice', schema: NoticeSchema }]),
		AuthModule,
		forwardRef(() => MemberModule),
	],
	providers: [NoticeResolver, NoticeService],
	exports: [NoticeService],
})
export class NoticeModule {}