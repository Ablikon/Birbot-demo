import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface OrderLoadQueueMessageModel extends Base {
}
export declare class OrderLoadQueueMessageModel extends TimeStamps {
    queueId: Types.ObjectId;
    message: string;
    totalAmount: number;
    isOk: boolean;
    isError: boolean;
    isLoadingFinished: boolean;
}
