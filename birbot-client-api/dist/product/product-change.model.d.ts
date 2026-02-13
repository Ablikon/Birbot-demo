import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface ProductChangeModel extends Base {
}
export declare class ProductChangeModel extends TimeStamps {
    sku: string;
    oldPrice: number;
    newPrice: number;
    startChangingDate: Date;
    changedDate: Date;
    time: number;
    storeId: Types.ObjectId;
    storeName: string;
}
