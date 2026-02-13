import { Types } from 'mongoose';
export declare class AnalyticsProductModel {
    _id: Types.ObjectId;
    sku: string;
    name: string;
    brand: string;
    categoryId: string;
    goldLinkedProducts: any[];
    createdAt: Date;
}
