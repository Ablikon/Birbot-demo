import { Types } from 'mongoose';
export declare class PaymentModel {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    storeId: Types.ObjectId;
    price: number;
    type: string;
    newExpireDate: Date;
    createdAt: Date;
    updatedAt: Date;
}
