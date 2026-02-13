import { prop, index } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export interface GoldLinkedProductModel extends Base {}

@index({ storeId: 1, productId: 1 }, { unique: true })
@index({ storeId: 1, isLinked: 1 })
export class GoldLinkedProductModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true, ref: 'Store' })
    storeId: Types.ObjectId

    @prop({ type: () => Types.ObjectId, required: true, ref: 'Product' })
    productId: Types.ObjectId

    @prop({ type: () => Boolean, required: true, default: false })
    isLinked: boolean
}
