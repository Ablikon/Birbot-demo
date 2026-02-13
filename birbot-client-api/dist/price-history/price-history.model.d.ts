import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
declare class PriceModel {
    new: number;
    old: number;
}
declare class StoresModel {
    id: string;
    name: string;
    shopLink: string;
    price: number;
    rating: number;
}
export interface PriceHistoryModel extends Base {
}
export declare class PriceHistoryModel extends TimeStamps {
    userId: Types.ObjectId;
    storeId: Types.ObjectId;
    sku: string;
    price: PriceModel;
    stores: StoresModel[];
}
export {};
