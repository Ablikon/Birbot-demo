import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator'

export class UpdateProductCitiesDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    productCityId: string

    @ApiProperty()
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    availableMinPrice: number

    @ApiProperty()
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    availableMaxPrice: number

    @ApiProperty()
    @IsBoolean()
    isDemping: boolean

    @ApiProperty()
    @IsBoolean()
    isAutoRaise: boolean
    
    @ApiProperty()
    @IsNumber()
    @Min(0)
    dempingPrice: number
}
