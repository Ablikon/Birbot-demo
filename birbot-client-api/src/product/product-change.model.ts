import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export interface ProductChangeModel extends Base {}

export class ProductChangeModel extends TimeStamps {
    @prop({ type: () => String, required: true })
    sku: string

    @prop({ type: () => Number, required: true })
    oldPrice: number

    @prop({ type: () => Number, default: 0 })
    newPrice: number

    @prop({ type: () => Date, required: true })
    startChangingDate: Date

    @prop({ type: () => Date, default: null })
    changedDate: Date

    @prop({ type: () => Number, default: 0 })
    time: number

    @prop({ type: () => Types.ObjectId, required: true })
    storeId: Types.ObjectId

    @prop({ type: () => String, required: true })
    storeName: string
}
