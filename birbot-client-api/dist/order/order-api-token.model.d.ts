import { Types } from 'mongoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
export interface OrderApiTokenModel extends Base {
}
export declare class OrderApiTokenModel extends TimeStamps {
    storeId: Types.ObjectId;
    token: string;
}
