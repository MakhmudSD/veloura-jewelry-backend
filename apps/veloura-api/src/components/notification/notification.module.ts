import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import NotificationSchema from '../../schemas/Notification.model';
import { NotificationService } from './notification.service';
import { NotificationResolver } from './notification.resolver';
import { NotificationGateway } from './notification.gateway';
import { AuthModule } from '../auth/auth.module'; // for AuthGuard
import { MemberModule } from '../member/member.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{
				name: 'Notification',
				schema: NotificationSchema,
			},
		]),
		AuthModule,
	],
	providers: [NotificationService, NotificationResolver, NotificationGateway],
	exports: [NotificationService, NotificationGateway],
})
export class NotificationModule {}
