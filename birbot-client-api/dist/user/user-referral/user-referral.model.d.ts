import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface UserReferralModel extends Base {
}
export declare class UserReferralModel extends TimeStamps {
    userId: Types.ObjectId;
    code: string;
}
