import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface ProductLoadQueueMessageModel extends Base {
}
export declare class ProductLoadQueueMessageModel extends TimeStamps {
    queueId: Types.ObjectId;
    message: string;
    isOk: boolean;
    isError: boolean;
    isLoadingFinished: boolean;
}
