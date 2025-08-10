import { registerEnumType } from "@nestjs/graphql";
import { CANCELLED } from "dns";

export enum OrderStatus {
  FINISH = "FINISH",
  PROCESS = "PROCESS",
  PAUSE = "PAUSE",
  DELETE = "DELETE",
  CANCEL = "CANCEL",
}

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
}); 