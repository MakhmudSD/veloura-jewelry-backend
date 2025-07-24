import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import { ProductModule } from '../product/product.module';
import { MemberModule } from '../member/member.module';
import OrderSchema from '../../schemas/Order.model';
import OrderItemSchema from '../../schemas/OrderItem.model';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Order', schema: OrderSchema },
			{ name: 'OrderItem', schema: OrderItemSchema },
		]),
		forwardRef(() => ProductModule), // Handle circular dependency
		forwardRef(() => MemberModule), // Handle circular dependency
		AuthModule,
	],
	providers: [OrderResolver, OrderService],
	exports: [OrderService], // Export OrderService for use in other modules
})
export class OrderModule {}
