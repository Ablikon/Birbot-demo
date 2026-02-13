import { ModelType } from '@typegoose/typegoose/lib/types';
import { UserModel } from '../user.model';
import { UserReferralModel } from './user-referral.model';
import { Types } from 'mongoose';
import { PaymentModel } from 'src/payment/payment.model';
import { ReferralPaymentModel } from 'src/payment/referral-payment.model';
type Referral = {
    name: string;
    registrationDate: Date;
    income: number;
    used: boolean;
};
type ReferralResponseType = {
    refCode: string;
    totalRefCount: number;
    totalIncome: number;
    monthlyRefCount: number;
    monthlyIncome: number;
    balance: number;
    referrals: Referral[];
};
export declare class UserReferralService {
    private readonly userReferralModel;
    private readonly userModel;
    private readonly paymentModel;
    private readonly referralPaymentModel;
    constructor(userReferralModel: ModelType<UserReferralModel>, userModel: ModelType<UserModel>, paymentModel: ModelType<PaymentModel>, referralPaymentModel: ModelType<ReferralPaymentModel>);
    test(): Promise<void>;
    generateCode(userId: string): Promise<void>;
    getUserIdByCode(code: string): Promise<null | Types.ObjectId>;
    getCodeByUserId(userId: string): Promise<string>;
    getUserReferrals(userId: string): Promise<ReferralResponseType>;
    sendReferralMoneyBackMessage(userId: string, value: number): Promise<{
        success: boolean;
    }>;
}
export {};
