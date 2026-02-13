import { Base, TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { Types } from "mongoose";
export interface ApproveProductForSaleHistoryModel extends Base {
}
export declare class ApproveProductForSaleHistoryModel extends TimeStamps {
    productId: Types.ObjectId;
    storeId: Types.ObjectId;
    status: number;
}
