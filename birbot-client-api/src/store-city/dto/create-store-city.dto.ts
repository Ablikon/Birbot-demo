import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class CreateStoreCityDto {
    @ApiProperty({
        required: true,
    })
    @IsString()
    @IsNotEmpty()
    storeId: string

    @ApiProperty({
        required: true,
    })
    @IsString()
    @MinLength(1)
    @IsNotEmpty()
    cityId: string
}
