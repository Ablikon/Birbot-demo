import { prop } from '@typegoose/typegoose'
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export class KaspiProductAvailabilityOnPickupPointModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true, ref: 'Product' })
    productId: Types.ObjectId

    @prop({ type: () => Types.ObjectId, required: true, ref: 'KaspiStorePickupPoint' })
    storePickupPointId: Types.ObjectId

    @prop({ type: () => Number, default: null })
    amount: number | null

    @prop({ type: () => Number, default: 0 })
    preOrder: number

    @prop({ type: () => Boolean, default: false })
    available: boolean
}
