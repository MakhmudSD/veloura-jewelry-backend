import { registerEnumType } from '@nestjs/graphql';

export enum ProductCategory {
  RING = 'RING',
  NECKLACE = 'NECKLACE',
  EARRINGS = 'EARRINGS',
  BRACELET = 'BRACELET',
  DIAMOND = 'DIAMOND',
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
	WHITE_GOLD = 'WHITE_GOLD',
	ROSE_GOLD = 'ROSE_GOLD',
	STERLING_SILVER = 'STERLING_SILVER',
	DIAMOND = 'DIAMOND',
	GEMSTONE = 'GEMSTONE',
	PEARL = 'PEARL',
	TITANIUM = 'TITANIUM',
	BRONZE = 'BRONZE',
	CRYSTAL = 'CRYSTAL',
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
