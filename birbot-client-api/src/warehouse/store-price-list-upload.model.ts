import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export interface StorePriceListUploadModel extends Base {}

export class StorePriceListUploadModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true })
    storeId: Types.ObjectId

    @prop({ type: () => String, required: true })
    originalFileName: string

    @prop({ type: () => Number, default: 0 })
    distinctOffersCount: number
}
