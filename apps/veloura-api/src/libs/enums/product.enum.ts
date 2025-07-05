import { registerEnumType } from '@nestjs/graphql';

export enum ProductCategory {
  RING = 'RING',
  NECKLACE = 'NECKLACE',
  EARRINGS = 'EARRINGS',
  BRACELET = 'BRACELET',
  SET = 'SET',
}
registerEnumType(ProductCategory, {
  name: 'ProductCategory',
});


export enum ProductLocation {
  SEOUL = 'SEOUL',
  BUSAN = 'BUSAN',
  INCHEON = 'INCHEON',
  DAEGU = 'DAEGU',
  GYEONGJU = 'GYEONGJU',
  GWANGJU = 'GWANGJU',
  JEONJU = 'JEONJU',
  DAEJEON = 'DAEJEON',
  JEJU = 'JEJU',
  PARIS = 'PARIS',
  TOKYO = 'TOKYO',
  NEWYORK = 'NEWYORK',
  MILAN = 'MILAN',
}

registerEnumType(ProductLocation, {
  name: 'ProductLocation',
});

export enum ProductStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  DELETE = 'DELETE',
}
registerEnumType(ProductStatus, {
  name: 'ProductStatus',
});

export enum ProductMaterial {
  GOLD = 'GOLD',
  SILVER = 'SILVER',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
}
registerEnumType(ProductMaterial, {
  name: 'ProductMaterial',
});

export enum ProductGender {
  MEN = 'MEN',
  WOMEN = 'WOMEN',
}

registerEnumType(ProductGender, {
  name: 'ProductGender',
});
