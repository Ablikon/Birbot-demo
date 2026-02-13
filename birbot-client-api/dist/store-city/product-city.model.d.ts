import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface ProductCityModel extends Base {
}
export declare class ProductCityModel extends TimeStamps {
    storeCityId: Types.ObjectId;
    productId: Types.ObjectId;
    availableMinPrice: number;
    availableMaxPrice: number;
    isDemping: boolean;
    isAutoRaise: boolean;
    dempingPrice: number;
}
