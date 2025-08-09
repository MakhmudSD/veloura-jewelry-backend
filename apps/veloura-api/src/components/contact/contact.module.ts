// src/contact/contact.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactService } from './contact.service';
import { ContactResolver } from './contact.resolver';
import { Contact, ContactSchema } from '../../schemas/Contact.schema';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }]), 
    NotificationModule],
  providers: [ContactService, ContactResolver],
  exports: [ContactService, MongooseModule],
})
export class ContactModule {}
