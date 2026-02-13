import { prop, modelOptions } from '@typegoose/typegoose'
import { Types } from 'mongoose'

@modelOptions({ schemaOptions: { timestamps: true } })
export class KaspiMarketingModel {
    _id: Types.ObjectId

    @prop()
    storeId: Types.ObjectId

    @prop()
    productSku: string

    @prop()
    createdAt: Date
}
