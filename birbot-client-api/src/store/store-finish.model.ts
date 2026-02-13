import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export interface StoreFinishModel extends Base {}

export class StoreFinishModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true })
    storeId: Types.ObjectId

    @prop({ type: () => String, required: true })
    storeName: string

    @prop({ type: () => Number, default: 0 })
    time: number

    @prop({ type: () => Date, required: true })
    startTime: Date

    @prop({ type: () => Date, required: true })
    endTime: Date

    @prop({ type: () => Number, default: 0 })
    productsCount: number
}
