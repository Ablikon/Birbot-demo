import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface GoldLinkedProductModel extends Base {
}
export declare class GoldLinkedProductModel extends TimeStamps {
    storeId: Types.ObjectId;
    productId: Types.ObjectId;
    isLinked: boolean;
}
