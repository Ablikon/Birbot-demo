import { prop } from "@typegoose/typegoose";
import { Base, TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";

export interface ApproveProductForSaleHistoryModel extends Base { }

export class ApproveProductForSaleHistoryModel extends TimeStamps {
  @prop({ type: () => Types.ObjectId, required: true })
  productId: Types.ObjectId;

  @prop({ type: () => Types.ObjectId, required: true })
  storeId: Types.ObjectId;

  @prop({ type: () => Number, default: "" })
  status: number;
}
