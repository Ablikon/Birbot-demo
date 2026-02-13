import { Types } from 'mongoose';
export declare enum KaspiStorePickupPointStatusEnum {
    ACTIVE = "ACTIVE",
    INACTIVE = "INACTIVE"
}
export declare class KaspiStorePickupPointModel {
    storeId?: Types.ObjectId;
    formattedAddress: string;
    status: KaspiStorePickupPointStatusEnum;
    name: string;
    displayName: string;
    cityId: string;
    cityName: string;
    available: boolean;
    virtual: boolean;
    warehouse: boolean;
}
