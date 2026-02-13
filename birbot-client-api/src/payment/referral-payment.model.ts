import { prop, modelOptions } from '@typegoose/typegoose'
import { Types } from 'mongoose'

@modelOptions({ schemaOptions: { timestamps: true } })
export class ReferralPaymentModel {
    _id: Types.ObjectId

    @prop()
    userId: Types.ObjectId

    @prop()
    price: number

    @prop({ default: false })
    isUsed: boolean

    @prop()
    createdAt: Date

    @prop()
    updatedAt: Date
}
