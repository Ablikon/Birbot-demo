import { IsNumber } from 'class-validator'

export class UpdateAvailablePriceProductDto {
    @IsNumber()
    availableMinPrice: number
}
