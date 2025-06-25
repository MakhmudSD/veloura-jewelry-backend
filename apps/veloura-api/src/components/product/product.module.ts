import { Module } from '@nestjs/common';
import { ProductResolver } from './product.resolver';
import { ProductService } from './product.service';
import { MongooseModule } from '@nestjs/mongoose';
import ProductSchema from '../../schemas/Product.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { MemberModule } from '../member/member.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Property', schema: ProductSchema }]),
		AuthModule,
		ViewModule,
		MemberModule,
	],
	providers: [ProductResolver, ProductService],
	exports: [ProductService]
})
export class ProductModule {}
