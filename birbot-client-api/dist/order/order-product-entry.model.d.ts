import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
export interface OrderProductEntryModel extends Base {
}
export declare class OrderProductEntryModel extends TimeStamps {
    orderId: string;
    productName: string;
    deliveryCost: string;
    orderCode: string;
    productCode: string;
    productId: string;
    quantity: number;
    totalPrice: number;
    basePrice: number;
    category: {
        code: string;
        name: string;
    };
    weight: number;
    comment: string;
    barCode: string;
}
