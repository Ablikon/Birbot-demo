import { Types } from 'mongoose';
export declare class ReferralPaymentModel {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    price: number;
    isUsed: boolean;
    createdAt: Date;
    updatedAt: Date;
}
