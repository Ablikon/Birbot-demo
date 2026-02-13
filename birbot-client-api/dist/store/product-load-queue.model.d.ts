import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface ProductLoadQueueModel extends Base {
}
export declare class ProductLoadQueueModel extends TimeStamps {
    storeId: Types.ObjectId;
    isFinished: boolean;
    isError: boolean;
    isOk: boolean;
    isProcessing: boolean;
    messages: [];
}
