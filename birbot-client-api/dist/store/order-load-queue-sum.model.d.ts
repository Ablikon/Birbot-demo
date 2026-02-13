import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface OrderLoadQueueSumModel extends Base {
}
export declare class OrderLoadQueueSumModel extends TimeStamps {
    queueId: Types.ObjectId;
    updatedCount: number;
    totalAmount: number;
}
