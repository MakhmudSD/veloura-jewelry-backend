import { registerEnumType } from "@nestjs/graphql";

export enum InquiryType {
    GENERAL = 'GENERAL',
    DELIVERY = 'DELIVERY',
    PRODUCT = 'PRODUCT',
    ACCOUNT = 'ACCOUNT',
    ORDER = 'ORDER',
  }
  registerEnumType(InquiryType, { name: 'InquiryType' });