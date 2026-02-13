import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'

export class VerifyDto {
    @IsString()
    @Length(4)
    @ApiProperty({ required: true })
    code: string

    @IsString()
    @IsNotEmpty()
    @ApiProperty({ required: true })
    phone: string

    @IsOptional()
    @ApiProperty({ required: false })
    refCode?: string

    @IsOptional()
    @ApiProperty({ required: false })
    clientInfo?: {
        timezone?: string
        screen?: string
    }
    
    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    fbp: string

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    fbc: string
}
