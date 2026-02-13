import { ApiProperty } from '@nestjs/swagger'
import { ArrayMinSize, IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'

export class ProductDeliveryDurationDto {
    @IsNotEmpty()
    @IsArray()
    @ArrayMinSize(1)
    @ApiProperty({})
    deliveryDurations?: string[]

    @IsNotEmpty()
    @ApiProperty({ required: true })
    sku: string
}

export class ProductDeliveryDurationManyDto {
    @IsArray()
    @ArrayMinSize(1)
    @ApiProperty({})
    deliveryDurations?: string[]

    @IsNotEmpty()
    @IsArray()
    @ApiProperty({ required: true })
    sku: string[]
}

