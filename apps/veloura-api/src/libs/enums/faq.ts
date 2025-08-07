import { registerEnumType } from "@nestjs/graphql";

export enum FaqStatus {
    ACTIVE = 'ACTIVE',
    BLOCKED = 'BLOCKED',
    DELETED = 'DELETED',
  }

  registerEnumType(FaqStatus, {
    name: 'FaqStatus',
  });
  

export enum FaqCategory {
    GENERAL = 'GENERAL',
    FOR_BUYERS = 'FOR_BUYERS',
    FOR_STORES = 'FOR_STORES',
    MEMBERSHIP = 'MEMBERSHIP',
    COMMUNITY = 'COMMUNITY',
    PAYMENT = 'PAYMENT',
    PRODUCT = 'PRODUCT',
    OTHERS = 'OTHERS', 
  }

    registerEnumType(FaqCategory, {
        name: 'FaqCategory',
    });