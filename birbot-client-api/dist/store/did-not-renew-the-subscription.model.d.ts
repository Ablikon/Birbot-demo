import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export declare enum DidNotRenewTheSubscriptionTypeEnum {
    'WEEK' = "WEEK",
    'MONTH' = "MONTH",
    'THREE_MONTH' = "THREE_MONTH"
}
export interface DidNotRenewTheSubscriptionModel extends Base {
}
export declare class DidNotRenewTheSubscriptionModel extends TimeStamps {
    type: DidNotRenewTheSubscriptionTypeEnum;
    userId: Types.ObjectId;
}
