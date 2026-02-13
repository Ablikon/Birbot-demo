import { Types } from 'mongoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
export interface GetOrderDetailsModel extends Base {
}
export declare class GetOrderDetailsModel extends TimeStamps {
    storeId: Types.ObjectId;
    orderCode: string;
}
