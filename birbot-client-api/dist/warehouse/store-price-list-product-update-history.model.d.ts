import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface StorePriceListProductUpdateHistoryModel extends Base {
}
export declare class StorePriceListProductUpdateHistoryModel extends TimeStamps {
    storeId: Types.ObjectId;
    storePriceListUploadId: Types.ObjectId;
    productSku: string;
    productName: string;
    status: string;
}
