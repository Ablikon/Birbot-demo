import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'

export class UpdateDempingProductDto {
    @IsBoolean()
    @IsNotEmpty()
    @ApiProperty({ required: true })
    isDemping: boolean

    @ApiProperty({ required: false })
    productId: string
}
