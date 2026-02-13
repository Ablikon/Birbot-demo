import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, Min } from 'class-validator'

export class UpdateDempingPriceDto {
    @ApiProperty({
        required: true,
    })
    @IsNumber()
    @Min(0)
    dempingPrice: number
}
