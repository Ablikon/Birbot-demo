import { Base, TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";
export interface ChangePriceRequestResultModel extends Base {
}
export declare class ChangePriceRequestResultModel extends TimeStamps {
    productId: Types.ObjectId;
    storeId: Types.ObjectId;
    data: any;
    createdAt?: Date;
}
