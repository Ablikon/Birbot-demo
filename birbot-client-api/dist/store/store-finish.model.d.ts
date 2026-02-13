import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface StoreFinishModel extends Base {
}
export declare class StoreFinishModel extends TimeStamps {
    storeId: Types.ObjectId;
    storeName: string;
    time: number;
    startTime: Date;
    endTime: Date;
    productsCount: number;
}
