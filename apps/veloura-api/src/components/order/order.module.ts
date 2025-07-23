import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OrderItemSchema, OrderSchema } from '../../schemas/Order.model';
import { OrderResolver } from './order.resolver';
import { OrderService } from './order.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Order', schema: OrderSchema },
      { name: 'OrderItem', schema: OrderItemSchema },
    ]),
  ],
  providers: [OrderResolver, OrderService],
  exports: [OrderService],
})
export class OrderModule {}