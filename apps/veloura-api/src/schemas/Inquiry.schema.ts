// schemas/inquiry.schema.ts
import mongoose, { Schema, Document } from 'mongoose';
import { InquiryType } from '../libs/enums/inquiry';

export interface Inquiry extends Document {
	memberId: mongoose.Types.ObjectId;
	inquiryType: InquiryType;
	content: string;
	reply?: string;
	createdAt: Date;
	updatedAt: Date;
}

const InquirySchema = new Schema<Inquiry>(
	{
		memberId: {
			type: Schema.Types.ObjectId,
			ref: 'Member',
			required: true,
		},
		inquiryType: {
			type: String,
			enum: InquiryType,
			required: true,
		},
		content: {
			type: String,
			required: true,
		},
		reply: {
			type: String,
		},
	},
	{ timestamps: true, collection: 'inquiries' },
);

export default InquirySchema;
