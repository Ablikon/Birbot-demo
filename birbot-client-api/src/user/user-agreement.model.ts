import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

export interface UserAgreementModel extends Base {}

export class UserAgreementModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true, unique: true })
    userId: Types.ObjectId

    @prop({ type: () => Boolean, default: false })
    userAgreementAccepted: boolean

    @prop({ type: () => Date, default: () => new Date() })
    userAgreementAcceptedAt: Date

    @prop({ type: () => String, default: '' })
    ip: string

    @prop({ type: () => String, default: '' })
    userAgent: string

    @prop({ type: () => Object, default: {} })
    clientInfo?: Record<string, any>
}

