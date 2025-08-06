import { AuthModule } from './../auth/auth.module';
import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import NoticeSchema from '../../schemas/Notice.model'; // Adjust path to your NoticeSchema
import { MemberModule } from '../member/member.module';
import { LikeModule } from '../like/like.module';
import { InquiryResolver } from './inquiry.resolver';
import { InquiryService } from './inquiry.service';
import InquirySchema from '../../schemas/Inquiry.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Inquiry', schema: InquirySchema }]),
    AuthModule,
    forwardRef(() => MemberModule), // only if needed
  ],
  providers: [InquiryResolver, InquiryService],
  exports: [InquiryService],
})
export class InquiryModule {}
