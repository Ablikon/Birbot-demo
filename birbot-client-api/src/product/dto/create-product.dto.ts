import { IsNumber, IsString } from 'class-validator'

export class CreateProductDto {
    @IsString()
    sku: string

    @IsString()
    name: string

    @IsNumber()
    price: number

    url: string
    brand: string
    category: string
    img: string
    masterProduct: object
    cityData: any
    storeId: string
    isChanging: boolean
    isActive: boolean
    merchantId: string
}
