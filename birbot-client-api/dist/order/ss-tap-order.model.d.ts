import { Types } from 'mongoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
export interface SSTapOrderModel extends Base {
}
export declare class SSTapOrderModel extends TimeStamps {
    storeId: Types.ObjectId;
    totalPrice: number;
    customerFirstName: string;
    customerLastName: string;
    customerPhone: string;
    deliveryAddress: string;
    state: string;
    creationDate: Date;
    completedDate: Date | null;
    products: {
        code: string;
        cost: number;
    }[];
}
