import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export enum DidNotRenewTheSubscriptionTypeEnum {
    'WEEK' = 'WEEK',
    'MONTH' = 'MONTH',
    'THREE_MONTH' = 'THREE_MONTH',
}

export interface DidNotRenewTheSubscriptionModel extends Base {}

export class DidNotRenewTheSubscriptionModel extends TimeStamps {
    @prop({
        type: () => String,
        enum: DidNotRenewTheSubscriptionTypeEnum,
        required: true,
    })
    type: DidNotRenewTheSubscriptionTypeEnum

    @prop({ type: () => Types.ObjectId, required: true })
    userId: Types.ObjectId
}
