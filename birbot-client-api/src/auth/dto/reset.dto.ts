import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsOptional } from 'class-validator'

export class ResetPasswordDto {
    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true })
    phone: string

    @ApiProperty({ required: true })
    @IsString()
    @IsOptional()
    captchaToken?: string
}
