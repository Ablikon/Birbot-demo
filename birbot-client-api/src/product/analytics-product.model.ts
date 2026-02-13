import { prop, modelOptions } from '@typegoose/typegoose'
import { Types } from 'mongoose'

@modelOptions({ schemaOptions: { timestamps: true } })
export class AnalyticsProductModel {
    _id: Types.ObjectId

    @prop()
    sku: string

    @prop()
    name: string

    @prop()
    brand: string

    @prop()
    categoryId: string

    @prop()
    goldLinkedProducts: any[]

    @prop()
    createdAt: Date
}
