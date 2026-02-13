import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'
export interface OrderLoadQueueMessageModel extends Base {}
export class OrderLoadQueueMessageModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true })
    queueId: Types.ObjectId
    @prop({ type: () => String, default: '' })
    message: string
    @prop({ type: () => Number, default: 0 })
    totalAmount: number
    @prop({ type: () => Boolean, default: false })
    isOk: boolean
    @prop({ type: () => Boolean, default: false })
    isError: boolean
    @prop({ type: () => Boolean, default: false })
    isLoadingFinished: boolean
}