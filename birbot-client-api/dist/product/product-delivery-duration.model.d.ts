import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export declare enum ProductDeliveryDurationEnum {
    EXPRESS = "EXPRESS",
    TODAY = "TODAY",
    TOMORROW = "TOMORROW",
    TILL_2_DAYS = "TILL_2_DAYS",
    TILL_5_DAYS = "TILL_5_DAYS",
    TILL_7_DAYS = "TILL_7_DAYS",
    OTHER = "OTHER",
    ALL = "ALL"
}
export interface ProductDeliveryDurationModel extends Base {
}
export declare class ProductDeliveryDurationModel extends TimeStamps {
    sku: string;
    storeId: Types.ObjectId;
    deliveryDuration: ProductDeliveryDurationEnum[];
}
