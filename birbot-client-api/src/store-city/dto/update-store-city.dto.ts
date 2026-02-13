import { ApiOperation, ApiProperty } from '@nestjs/swagger'
import { IsObject, IsOptional, IsString, Min, MinLength } from 'class-validator'
import { ObjectId } from 'mongoose'

export class UpdateStoreCityDto {
    @ApiProperty()
    @IsString()
    @MinLength(1)
    cityId: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    dempingCityId: string
    
    @IsString()
    @ApiProperty()
    userId: string

    @IsString()
    @ApiProperty()
    storeId: string
}
