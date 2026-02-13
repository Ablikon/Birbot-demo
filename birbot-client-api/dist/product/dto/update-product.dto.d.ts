export declare class UpdateProductWarehouseDto {
    productId: string;
    storePickupPointId: string;
    amount?: number;
    preOrder?: number;
    available?: boolean;
}
export declare class UpdateProductDto {
    cityId?: string;
    price?: number;
    availableMinPrice?: number;
    availableMaxPrice?: number;
    isUpdateEveryWeek?: boolean;
    isSetMinPrice?: boolean;
    amount?: number;
    isWithdrawFromSale?: boolean;
    isDemping?: boolean;
    isAutoRaise?: boolean;
    dempingPrice?: number;
    productWarehouses?: [UpdateProductWarehouseDto];
    orderAutoAccept?: boolean;
    isDempingOnlyMainCity?: boolean;
    purchasePrice?: number;
    autoacceptOrder?: boolean;
    isPreOrder?: boolean;
    preOrderDays?: number;
    marginPercent?: number;
    bonus?: number;
    minBonus?: number;
    maxBonus?: number;
    isBonusDemping?: boolean;
    loanPeriod?: number;
}
