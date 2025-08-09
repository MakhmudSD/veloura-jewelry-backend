import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';
import { ProductModule } from '../product/product.module';
import { MemberModule } from '../member/member.module';
import OrderSchema from '../../schemas/Order.model';
import OrderItemSchema from '../../schemas/OrderItem.model';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';
import ProductSchema from '../../schemas/Product.model';
import MemberSchema from '../../schemas/Member.model';

@Module({
  imports: [
	MongooseModule.forFeature([
	  { name: 'Order', schema: OrderSchema },
	  { name: 'OrderItem', schema: OrderItemSchema },
	  { name: 'Product', schema: ProductSchema },
	  { name: 'Member', schema: MemberSchema },               // <-- provide it here
	]),
	AuthModule,                                               // if you use AuthService
	NotificationModule,                                       // to inject NotificationService
	ProductModule,                                            // if you use ProductService
	MemberModule,                                             // if you use MemberService
  ],
  providers: [OrderService, OrderResolver],
  exports: [OrderService],
})
export class OrderModule {}
