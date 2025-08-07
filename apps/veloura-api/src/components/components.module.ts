import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { FollowModule } from './follow/follow.module';
import { BoardArticleModule } from './board-article/board-article.module';
import { OrderModule } from './order/order.module';
import { FaqModule } from './faq/faq.module';
import { Contact } from '../schemas/Contact.schema';
import { NoticeModule } from './notice/notice.module';
import { ContactModule } from './contact/contact.module';

@Module({
	imports: [
		MemberModule,
		AuthModule,
		ProductModule,
		BoardArticleModule,
		LikeModule,
		ViewModule,
		CommentModule,
		FollowModule,
		NoticeModule,
		OrderModule,
		ContactModule,
		FaqModule
	]})
export class ComponentsModule {}
