import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
export interface KaspiStoreUploadLimitModel extends Base {
}
export declare class KaspiStoreUploadLimitModel extends TimeStamps {
    merchantId: string;
    limitType: "OFFER" | "NEW";
    uploadedCount: number;
    expirationDate: Date;
    unlimited: boolean;
    maxCount: number;
    actualizedFromKaspiDate: Date;
    isUploading: boolean;
}
