import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'
export interface OrderLoadQueueSumModel extends Base {}
export class OrderLoadQueueSumModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true })
    queueId: Types.ObjectId
    @prop({ type: () => Number, required: true })
    updatedCount: number
    @prop({ type: () => Number, required: true })
    totalAmount: number
}