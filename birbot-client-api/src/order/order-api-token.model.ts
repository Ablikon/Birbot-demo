import { Types } from 'mongoose'
import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OrderApiTokenModel extends Base {}

export class OrderApiTokenModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true, unique: true })
    storeId: Types.ObjectId

    @prop({ type: () => String, required: true, unique: true })
    token: string
}
