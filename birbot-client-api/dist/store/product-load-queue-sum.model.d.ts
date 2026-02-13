import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface ProductLoadQueueSumModel extends Base {
}
export declare class ProductLoadQueueSumModel extends TimeStamps {
    queueId: Types.ObjectId;
    updatedCount: number;
    totalAmount: number;
}
