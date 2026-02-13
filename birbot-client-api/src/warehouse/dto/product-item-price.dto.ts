import { ProductItemPriceCityDto } from './product-item-price-city.dto'

export class ProductItemPriceDto {
    name: string
    sku: string
    isDemping: boolean
    isActive: boolean
    cities: ProductItemPriceCityDto[]
    dempingPrice: number
    line: number
    purchasePrice?: number
    price?: number
}
