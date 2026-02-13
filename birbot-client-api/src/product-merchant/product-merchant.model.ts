import { prop, modelOptions } from '@typegoose/typegoose'
import { Types } from 'mongoose'

@modelOptions({ schemaOptions: { timestamps: true } })
export class ProductMerchantModel {
    _id: Types.ObjectId

    @prop()
    storeId: Types.ObjectId

    @prop()
    productSku: string

    @prop()
    merchantId: string

    @prop()
    price: number

    @prop()
    createdAt: Date
}
