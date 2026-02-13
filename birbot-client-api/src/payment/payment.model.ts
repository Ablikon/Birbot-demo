import { prop, modelOptions } from '@typegoose/typegoose'
import { Types } from 'mongoose'

@modelOptions({ schemaOptions: { timestamps: true } })
export class PaymentModel {
    _id: Types.ObjectId

    @prop()
    userId: Types.ObjectId

    @prop()
    storeId: Types.ObjectId

    @prop()
    price: number

    @prop()
    type: string

    @prop()
    newExpireDate: Date

    @prop()
    createdAt: Date

    @prop()
    updatedAt: Date
}
