import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class RegistrationDto {
    @ApiProperty({ required: true })
    @IsString()
    email: string

    @ApiProperty({ required: true })
    @IsString()
    name: string

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    surname?: string

    @ApiProperty({ required: false })
    @IsOptional()
    refCode?: string

    @ApiProperty({ required: true })
    @IsString()
    @IsOptional()
    captchaToken?: string
}
