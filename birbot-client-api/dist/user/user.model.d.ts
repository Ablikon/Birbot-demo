import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface UserModel extends Base {
}
export declare class UserModel extends TimeStamps {
    email: string;
    name: string;
    surname: string;
    passwordHash: string;
    storeLimit: number;
    leadId: number;
    contactId: number;
    isRef: boolean;
    isBlocked: boolean;
    referer: Types.ObjectId;
    isShowAnalytics: boolean;
    isShowMessage: boolean;
    cid: string;
    topStoreStatistics: boolean;
    acceptTokensAfterDate: Date | null;
    analyticsManagersCount: number;
    expressAnalyticsRequestCount: number;
    isNew: boolean;
    showNewFeature: boolean;
    isPartcipiateInPaymentsAction: any;
}
