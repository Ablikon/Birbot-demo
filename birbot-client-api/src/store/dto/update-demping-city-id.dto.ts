import { ApiProperty } from '@nestjs/swagger'
import {  IsObject, IsString } from 'class-validator'

export class UpdateDempingCityIdDto {
    @ApiProperty({
        required: true,
    })
    @IsString()
    id: string

    @IsString()
    name: string

    @IsString()
    dempingCityId: string

    @IsString()
    userId: string
}
