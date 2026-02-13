import { prop, modelOptions } from '@typegoose/typegoose'
import { Types } from 'mongoose'

@modelOptions({ schemaOptions: { timestamps: true } })
export class IntegrationModel {
    _id: Types.ObjectId

    @prop()
    storeId: Types.ObjectId

    @prop()
    type: string

    @prop()
    url: string

    @prop()
    createdAt: Date
}
