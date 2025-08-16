import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Contact, ContactDocument } from '../../schemas/Contact.schema';
import { ContactModel } from '../../libs/dto/contact/contact.input';
import { CreateContactInput } from '../../libs/dto/contact/contact';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class ContactService {
	constructor(
		@InjectModel(Contact.name)
		private readonly contactModel: Model<ContactDocument>,
	) {}

	async create(createContactInput: CreateContactInput): Promise<ContactModel> {
		const created = await this.contactModel.create(createContactInput);
		return {
			_id: shapeIntoMongoObjectId(created._id),
			name: created.name,
			email: created.email,
			subject: created.subject,
			message: created.message,
			createdAt: created.createdAt,
		};
	}

	async findAll(): Promise<ContactModel[]> {
		const contacts = await this.contactModel.find().sort({ createdAt: -1 }).exec();

		return contacts.map((c) => ({
			_id: shapeIntoMongoObjectId(c._id),
			name: c.name,
			email: c.email,
			subject: c.subject,
			message: c.message,
			createdAt: c.createdAt,
		}));
	}
}
