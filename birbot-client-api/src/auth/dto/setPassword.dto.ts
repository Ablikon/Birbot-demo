import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength } from 'class-validator'

export class SetPasswordDto {
    @IsString()
    @MinLength(1)
    @ApiProperty({ required: true })
    token: string

    @MinLength(8)
    @IsString()
    @ApiProperty({ required: true })
    password: string

    @IsString()
    @ApiProperty({ required: true })
    utm_token: string

    @IsString()
    @ApiProperty({ required: true })
    utm_campaign: string

    @IsString()
    @ApiProperty({ required: true })
    utm_source: string

    @IsString()
    @ApiProperty({ required: true })
    utm_medium: string

    @IsString()
    @ApiProperty({ required: true })
    utm_content: string
}
