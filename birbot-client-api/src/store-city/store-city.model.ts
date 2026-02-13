import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export interface StoreCityModel extends Base {}

export class StoreCityModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true })
    storeId: Types.ObjectId

    @prop({ type: () => String, required: true })
    cityId: string

    @prop({ type: () => String, required: true })
    cityName: string

    @prop({ type: () => String, required: true })
    dempingCityId: string

    @prop({ type: () => Boolean, default: true })
    isActive: boolean
}
