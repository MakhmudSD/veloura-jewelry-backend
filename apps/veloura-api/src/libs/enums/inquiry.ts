import { registerEnumType } from "@nestjs/graphql";

export enum InquiryType {
    GENERAL = 'GENERAL',
    ACCOUNT = 'ACCOUNT',
    ORDER = 'ORDER',
  }
  registerEnumType(InquiryType, { name: 'InquiryType' });