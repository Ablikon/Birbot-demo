import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface UserAgreementModel extends Base {
}
export declare class UserAgreementModel extends TimeStamps {
    userId: Types.ObjectId;
    userAgreementAccepted: boolean;
    userAgreementAcceptedAt: Date;
    ip: string;
    userAgent: string;
    clientInfo?: Record<string, any>;
}
