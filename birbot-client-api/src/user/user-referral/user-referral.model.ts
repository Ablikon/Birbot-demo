import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'
import { prop } from '@typegoose/typegoose'

export interface UserReferralModel extends Base {}

export class UserReferralModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, unique: true, required: true })
    userId: Types.ObjectId

    @prop({ type: () => String, unique: true, required: true })
    code: string
}
