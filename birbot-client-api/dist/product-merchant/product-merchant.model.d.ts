import { Types } from 'mongoose';
export declare class ProductMerchantModel {
    _id: Types.ObjectId;
    storeId: Types.ObjectId;
    productSku: string;
    merchantId: string;
    price: number;
    createdAt: Date;
}
