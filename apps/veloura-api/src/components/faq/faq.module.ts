import { AuthModule } from './../auth/auth.module';
// faq.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FaqResolver } from './faq.resolver';
import { FaqService } from './faq.service';
import { FaqSchema } from '../../schemas/Faq.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Faq', schema: FaqSchema },
    ]),
    AuthModule,
  ],
  providers: [FaqResolver, FaqService],
  exports: [FaqService, MongooseModule], // ✅ Export these

})
export class FaqModule {}
