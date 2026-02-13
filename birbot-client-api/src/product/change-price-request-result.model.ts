import { prop } from "@typegoose/typegoose";
import { Base, TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";

export interface ChangePriceRequestResultModel extends Base {}

export class ChangePriceRequestResultModel extends TimeStamps {
  @prop({ type: () => Types.ObjectId, required: true })
  productId: Types.ObjectId;

  @prop({ type: () => Types.ObjectId, required: true })
  storeId: Types.ObjectId;

  @prop({ type: () => Object, default: {} })
  data: any;

  @prop({ type: () => Date, default: null })
  createdAt?: Date;
}
