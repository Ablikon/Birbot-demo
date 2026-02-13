import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'
export interface OrderLoadQueueModel extends Base {}
export class OrderLoadQueueModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true })
    storeId: Types.ObjectId
    @prop({ type: () => Boolean, default: false })
    isFinished: boolean
    @prop({ type: () => Boolean, default: false })
    isError: boolean
    @prop({ type: () => Boolean, default: false })
    isOk: boolean
    @prop({ type: () => Boolean, default: false })
    isProcessing: boolean
    @prop({ type: () => Array, default: [] })
    messages: []
}