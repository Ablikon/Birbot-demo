import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Min, IsNotEmpty } from 'class-validator'

export class UpdateProductCityDto {
    @ApiProperty()
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    availableMinPrice: number
}
