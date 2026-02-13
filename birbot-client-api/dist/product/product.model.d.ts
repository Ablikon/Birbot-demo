import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
interface PriceRow {
    price: number;
}
declare class CityData {
    id: string;
    name: string;
    minPrice: number;
    priceRow: PriceRow;
}
declare class CityPrices {
    cityId: string;
    value: number;
}
export interface ProductModel extends Base {
}
export declare class ProductModel extends TimeStamps {
    configId: Types.ObjectId;
    storeId: Types.ObjectId;
    sku: string;
    name: string;
    price: number | null;
    availableMinPrice: number;
    availableMaxPrice: number;
    isUpdateEveryWeek: boolean;
    isSetMinPrice: boolean;
    url: string;
    brand: string;
    category: string;
    img: string;
    isDemping: boolean;
    isChanging: boolean;
    masterProduct: any;
    cityData: CityData[];
    cityPrices: CityPrices[];
    newCityData: any[];
    isActive: boolean;
    amount: number;
    isAmountChanged: boolean;
    isWithdrawFromSale: boolean;
    place: number;
    isMinus: boolean;
    lastCheckedDate: Date;
    dempingPrice: number;
    isAutoRaise: boolean;
    orderAutoAccept: boolean;
    isDempingOnlyMainCity: boolean;
    purchasePrice: number;
    merchantId: string;
    loanPeriod: number;
    offersCount: number;
    autoacceptOrder: boolean;
    marginPercent: number;
    weight: number;
    isAuctionWinner: boolean;
    kaspiCabinetPosition: number;
    preOrderDays: number;
    isPreOrder: boolean;
    isBonusDemping: boolean;
    bonus: number;
    maxBonus: number;
    minBonus: number;
    productCampaignStatus: 'paused' | '' | 'Enabled';
}
export {};
