import { ApiProperty } from '@nestjs/swagger'
import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, isString } from 'class-validator'

export type warehouse = {
    displayName: string
    newPreorderDates: string
}

export class MassUpdateProductsDto {
    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(1)
    @ApiProperty({ required: true })
    productsId: string[]

    @IsOptional()
    @IsBoolean()
    @ApiProperty({})
    isDemping?: boolean

    @IsOptional()
    @IsBoolean()
    @ApiProperty({})
    isSetMinPrice?: boolean

    @IsOptional()
    @IsBoolean()
    @ApiProperty({})
    isAutoRaise?: boolean

    @IsOptional()
    @IsBoolean()
    @ApiProperty({})
    isUpdateEveryWeek?: boolean

    @IsOptional()
    @IsBoolean()
    @ApiProperty({})
    isDempingOnlyMainCity?: boolean

    @IsOptional()
    @IsBoolean()
    @ApiProperty({})
    isLoading?: boolean

    @IsOptional()
    @IsNumber()
    @ApiProperty({})
    dempingPrice?: number

    @IsBoolean()
    @IsOptional()
    @ApiProperty({})
    isApplyDempingPriceToEverything?: boolean

    @IsOptional()
    @IsString()
    @ApiProperty({})
    choosedFilter?: string

    @IsBoolean()
    @IsOptional()
    @ApiProperty({})
    isWithdrawFromSale?: boolean

   

    @IsOptional()
    @IsBoolean()
    @ApiProperty({})
    autoacceptOrder?: boolean

    @IsOptional()
    @IsString()
    @ApiProperty({})
    isSelectedCityId?: string

    @IsOptional()
    @IsArray()
    @ApiProperty({})
    preorderDate?: warehouse[]

    @IsOptional()
    @IsNumber()
    @ApiProperty({
        description: 'Бонус',
    })
    bonus?: number

    @IsOptional()
    @IsNumber()
    @ApiProperty({
        description: 'Минимальный бонус',
    })
    minBonus?: number

    @IsOptional()
    @IsNumber()
    @ApiProperty({
        description: 'Максимальный бонус',
    })
    maxBonus?: number

    @IsOptional()
    @IsBoolean()
    @ApiProperty({
        description: 'Бонусный демпинг',
    })
    isBonusDemping?: boolean
}
