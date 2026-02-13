import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export enum ProductDeliveryDurationEnum {
    EXPRESS = "EXPRESS",
    TODAY = "TODAY",
    TOMORROW = "TOMORROW",
    TILL_2_DAYS = "TILL_2_DAYS",
    TILL_5_DAYS = "TILL_5_DAYS",
    TILL_7_DAYS = "TILL_7_DAYS",
    OTHER = "OTHER",
    ALL = "ALL"
}

export interface ProductDeliveryDurationModel extends Base {}

export class ProductDeliveryDurationModel extends TimeStamps {
    @prop({ type: () => String, required: true })
    sku: string

    @prop({ type: () => Types.ObjectId, required: true })
    storeId: Types.ObjectId

    @prop({ type: () => [Object], default: [], required: true })
    deliveryDuration: ProductDeliveryDurationEnum[]
}
