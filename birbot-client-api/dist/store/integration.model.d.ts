import { Types } from 'mongoose';
export declare class IntegrationModel {
    _id: Types.ObjectId;
    storeId: Types.ObjectId;
    type: string;
    url: string;
    createdAt: Date;
}
