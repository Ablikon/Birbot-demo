import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface OrderLoadQueueModel extends Base {
}
export declare class OrderLoadQueueModel extends TimeStamps {
    storeId: Types.ObjectId;
    isFinished: boolean;
    isError: boolean;
    isOk: boolean;
    isProcessing: boolean;
    messages: [];
}
