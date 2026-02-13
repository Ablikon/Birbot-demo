import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
declare class MainCity {
    id: string;
    name: string;
    isDempingOnlyThisCity: boolean;
    dempingCityId: string;
}
export interface StoreModel extends Base {
}
export declare class StoreModel extends TimeStamps {
    marketplaceId: Types.ObjectId;
    userId: Types.ObjectId;
    expireDate: Date;
    login: string;
    password: string;
    name: string;
    slug: string;
    storeId: string;
    logo: string;
    url: string;
    isStarted: boolean;
    isProcessing: boolean;
    isBadCredentials: boolean;
    unauthDate: Date | null;
    isTest: boolean;
    mainCity: MainCity;
    cityLimit: number;
    cookie: string;
    dempingPrice: number;
    apiToken: string;
    isUpdatedLeadTest: boolean;
    isAutoRaise: boolean;
    phone: string;
    userAgent: string;
    maxDempingProducts: number;
    storeCode: string;
    maxNotCompeteStoreCount: number;
    requestType: string;
    changePriceMethod: string;
    orderStatusExpireDate: Date | null;
    token: string;
    userStartBotAccess: boolean;
    merchantOrderAccess: boolean;
    auctionAccess: boolean;
    isSendPhoneAuthorizationMessage: any;
    isDempingOnLoanPeriod: any;
    isPartcipiateInPaymentsAction: any;
    taxRegime: number | null;
    showDempingWarning: boolean;
}
export {};
