import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export interface BonusChangeModel extends Base {}

export class BonusChangeModel extends TimeStamps {
    @prop({ type: () => String, required: true })
    sku: string

    @prop({ type: () => Types.ObjectId, required: true })
    productId: Types.ObjectId

    @prop({ type: () => Types.ObjectId, required: true })
    storeId: Types.ObjectId

    @prop({ type: () => String, required: true })
    storeName: string

    @prop({ type: () => String, required: true })
    changeType: 'bonus' | 'maxBonus' | 'minBonus' | 'isBonusDemping'

    @prop({ type: () => Number, default: null })
    oldBonusValue: number | null

    @prop({ type: () => Number, default: null })
    newBonusValue: number | null

    @prop({ type: () => Boolean, default: null })
    oldBooleanValue: boolean | null

    @prop({ type: () => Boolean, default: null })
    newBooleanValue: boolean | null

    @prop({ type: () => Date, required: true, default: () => new Date() })
    changeDate: Date

    @prop({ type: () => String, default: 'MANUAL' })
    changeMethod: 'MANUAL' | 'AUTO' | 'API'

    @prop({ type: () => String, default: null })
    changedBy: string | null
}
