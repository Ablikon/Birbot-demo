import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

class MainCity {
    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    id?: string

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    name?: string

    @IsOptional()
    @IsBoolean()
    @ApiProperty({ required: false })
    isDempingOnlyThisCity?: boolean
}

export class UpdateStoreV2Dto {
    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    marketplaceId?: string

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    login?: string

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    password?: string

    @IsOptional()
    @IsString()
    @ApiProperty({ required: false })
    dempingPrice?: string

    @IsOptional()
    @IsBoolean()
    @ApiProperty({ required: false })
    isAutoRaise?: boolean

    @Type(() => MainCity)
    @IsOptional()
    @ApiProperty({ required: false })
    mainCity?: MainCity

    @IsOptional()
    @IsBoolean()
    @ApiProperty({ required: false })
    showDempingWarning?: boolean
}
