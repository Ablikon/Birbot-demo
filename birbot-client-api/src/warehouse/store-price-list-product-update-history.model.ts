import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export interface StorePriceListProductUpdateHistoryModel extends Base {}

export class StorePriceListProductUpdateHistoryModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true })
    storeId: Types.ObjectId

    @prop({ type: () => Types.ObjectId, required: true })
    storePriceListUploadId: Types.ObjectId

    @prop({ type: () => String, required: true })
    productSku: string

    @prop({ type: () => String, required: true })
    productName: string

    @prop({ type: () => String, required: true })
    status: string
}
