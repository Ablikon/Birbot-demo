import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
export interface StorePositionMetricsModel extends Base {
}
export declare class StorePositionMetricsModel extends TimeStamps {
    firstPositionPercentageWithCompetitivePriceFloor: number;
    nonFirstPositionPercentageDueToPriceLimit: number;
    saleScoutClientFirstPlacePresenceRate: number;
}
