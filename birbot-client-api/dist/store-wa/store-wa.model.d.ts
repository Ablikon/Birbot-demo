import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
export declare class StoreWAModel extends TimeStamps {
    storeId: string;
    phoneNumber: string;
    isActive: boolean;
}
