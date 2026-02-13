import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsOptional,   } from "class-validator"

export class UpdateUserNewFeatureDto {
    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        description: 'Онбординг для новых пользователей',
    })
    isNew?: boolean

    @IsBoolean()
    @IsOptional()
    @ApiProperty({
        description: 'Онбординг по новой фиче',
    })
    showNewFeature?: boolean
}