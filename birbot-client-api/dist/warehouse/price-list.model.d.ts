import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface PriceListModel extends Base {
}
export declare class PriceListModel extends TimeStamps {
    storeId: Types.ObjectId;
    name: string;
    url: string;
    fullPath: string;
}
