import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
export interface MarketplaceCityModel extends Base {
}
export declare class MarketplaceCityModel extends TimeStamps {
    marketplaceKey: string;
    id: string;
    name: string;
}
