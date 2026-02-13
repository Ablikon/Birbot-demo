import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface StoreStateHistoryModel extends Base {
}
export declare class StoreStateHistoryModel extends TimeStamps {
    storeId: Types.ObjectId;
    isStarted: boolean;
    author: string;
    authorId?: Types.ObjectId;
}
