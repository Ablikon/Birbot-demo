export declare class OtherCityDTO {
    cityId: string;
    availableMinPrice: number;
}
export declare class ExcelKaspiPriceListDTO {
    name: string;
    sku: string;
    availableMinPrice: number;
    remainder: number;
    otherCities: OtherCityDTO[];
    isDemping: boolean;
}
