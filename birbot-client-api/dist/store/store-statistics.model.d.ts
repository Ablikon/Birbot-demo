import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface StoreStatisticsModel extends Base {
}
export declare class StoreStatisticsModel extends TimeStamps {
    storeId: Types.ObjectId;
    topSellingProducts: [];
    topPoorlySellingProducts: [];
    topMarginProducts: [];
    topLowMarginProducts: [];
    topLowSellingCities: [];
    topSellingCities: [];
    topHighlyCompetitiveProducts: [];
    todayProfit: number;
    yesterdayProfit: number;
    weekProfit: number;
    monthProfit: number;
    rangeDataProfit: number;
}
