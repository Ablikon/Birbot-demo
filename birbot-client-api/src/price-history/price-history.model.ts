import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

class PriceModel {
    @prop({ type: () => Number })
    new: number

    @prop({ type: () => Number })
    old: number
}

class StoresModel {
    @prop({ type: () => String })
    id: string

    @prop({ type: () => String })
    name: string

    @prop({ type: () => String })
    shopLink: string

    @prop({ type: () => Number })
    price: number

    @prop({ type: () => Number })
    rating: number
}

export interface PriceHistoryModel extends Base {}

export class PriceHistoryModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId })
    userId: Types.ObjectId

    @prop({ type: () => Types.ObjectId })
    storeId: Types.ObjectId

    @prop({ type: () => String })
    sku: string

    @prop({ type: () => PriceModel, required: true })
    price: PriceModel

    @prop({ type: () => StoresModel })
    stores: StoresModel[]
}
