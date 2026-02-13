import { Types } from 'mongoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
export interface OrderModel extends Base {
}
export declare class OrderModel extends TimeStamps {
    storeId: Types.ObjectId;
    orderId: string;
    totalPrice: number;
    customerFirstName: string;
    customerLastName: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryCost: number;
    deliveryMode: string;
    town: string;
    orderCode: string;
    productId: string;
    productName: string;
    productCode: string;
    products: any[];
    quantity: number;
    state: string;
    status: string;
    creationDate: Date;
    completedDate: Date | null;
    url: string;
    category: {
        title: string;
        code: string;
    } | null;
    addressDisplayName: string;
    comment: string;
    reviewsSent: boolean;
    orderInfoSent: boolean;
    taplinkSent: boolean;
    fromSSTap: boolean;
}
