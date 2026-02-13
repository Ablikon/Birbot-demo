export type warehouse = {
    displayName: string;
    newPreorderDates: string;
};
export declare class MassUpdateProductsDto {
    productsId: string[];
    isDemping?: boolean;
    isSetMinPrice?: boolean;
    isAutoRaise?: boolean;
    isUpdateEveryWeek?: boolean;
    isDempingOnlyMainCity?: boolean;
    isLoading?: boolean;
    dempingPrice?: number;
    isApplyDempingPriceToEverything?: boolean;
    choosedFilter?: string;
    isWithdrawFromSale?: boolean;
    autoacceptOrder?: boolean;
    isSelectedCityId?: string;
    preorderDate?: warehouse[];
    bonus?: number;
    minBonus?: number;
    maxBonus?: number;
    isBonusDemping?: boolean;
}
