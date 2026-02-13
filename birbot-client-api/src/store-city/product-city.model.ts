import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export interface ProductCityModel extends Base {}

export class ProductCityModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true })
    storeCityId: Types.ObjectId

    @prop({ type: () => Types.ObjectId, required: true })
    productId: Types.ObjectId

    @prop({ type: () => Number, default: 0 })
    availableMinPrice: number

    @prop({ type: () => Number, default: 999999999 })
    availableMaxPrice: number

    @prop({ type: () => Boolean, default: true })
    isDemping: boolean

    @prop({ type: () => Boolean})
    isAutoRaise: boolean
    
    @prop({ type: () => Number})
    dempingPrice: number
}
