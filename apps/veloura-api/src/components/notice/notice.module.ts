import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoticeResolver } from './notice.resolver';
import { NoticeService } from './notice.service';
import NoticeSchema from '../../schemas/Notice.model'; // Adjust path to your NoticeSchema

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Notice', schema: NoticeSchema }]),
  ],
  providers: [NoticeResolver, NoticeService],
  exports: [NoticeService]
})
export class NoticeModule {}
