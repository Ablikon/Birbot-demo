import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface PriceListExampleModel extends Base {
}
export declare class PriceListExampleModel extends TimeStamps {
    storeId: Types.ObjectId;
    path: string;
    name: string;
}
