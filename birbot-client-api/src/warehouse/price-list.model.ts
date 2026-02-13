import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export interface PriceListModel extends Base {}

export class PriceListModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true })
    storeId: Types.ObjectId

    @prop({ type: () => String, required: true })
    name: string

    @prop({ type: () => String, required: true })
    url: string

    @prop({ type: () => String, required: true })
    fullPath: string
}
