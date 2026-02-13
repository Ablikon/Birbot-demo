import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface StoreCityModel extends Base {
}
export declare class StoreCityModel extends TimeStamps {
    storeId: Types.ObjectId;
    cityId: string;
    cityName: string;
    dempingCityId: string;
    isActive: boolean;
}
