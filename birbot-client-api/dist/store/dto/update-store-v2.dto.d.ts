declare class MainCity {
    id?: string;
    name?: string;
    isDempingOnlyThisCity?: boolean;
}
export declare class UpdateStoreV2Dto {
    marketplaceId?: string;
    login?: string;
    password?: string;
    dempingPrice?: string;
    isAutoRaise?: boolean;
    mainCity?: MainCity;
    showDempingWarning?: boolean;
}
export {};
