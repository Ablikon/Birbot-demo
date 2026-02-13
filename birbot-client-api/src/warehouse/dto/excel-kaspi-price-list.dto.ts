export class OtherCityDTO {
    cityId: string

    availableMinPrice: number
}

export class ExcelKaspiPriceListDTO {
    name: string

    sku: string

    availableMinPrice: number

    remainder: number

    otherCities: OtherCityDTO[]

    isDemping: boolean
}
