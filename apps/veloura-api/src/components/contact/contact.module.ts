// src/contact/contact.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactService } from './contact.service';
import { ContactResolver } from './contact.resolver';
import { Contact, ContactSchema } from '../../schemas/Contact.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Contact.name, schema: ContactSchema }])],
  providers: [ContactService, ContactResolver],
})
export class ContactModule {}
