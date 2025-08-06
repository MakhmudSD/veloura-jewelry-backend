import { registerEnumType } from "@nestjs/graphql";

export enum InquiryType {
    GENERAL = 'GENERAL',
    DELIVERY = 'DELIVERY',
    PRODUCT = 'PRODUCT',
    ACCOUNT = 'ACCOUNT',
  }
  registerEnumType(InquiryType, { name: 'InquiryType' });