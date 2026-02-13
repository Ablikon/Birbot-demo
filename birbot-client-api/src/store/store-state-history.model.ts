import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export interface StoreStateHistoryModel extends Base {}

export class StoreStateHistoryModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true })
    storeId: Types.ObjectId

    @prop({ type: () => Boolean, required: true })
    isStarted: boolean

    @prop({ type: () => String, required: true })
    author: string

    @prop({ type: () => Types.ObjectId, required: false })
    authorId?: Types.ObjectId
}
