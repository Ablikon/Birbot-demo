import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface StorePriceListUploadModel extends Base {
}
export declare class StorePriceListUploadModel extends TimeStamps {
    storeId: Types.ObjectId;
    originalFileName: string;
    distinctOffersCount: number;
}
