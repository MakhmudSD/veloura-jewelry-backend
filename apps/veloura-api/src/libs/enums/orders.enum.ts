import { registerEnumType } from "@nestjs/graphql";

export enum OrderStatus {
  FINISH = "FINISH",
  PROCESS = "PROCESS",
  PAUSE = "PAUSE",
  DELETE = "DELETE"
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
}); 