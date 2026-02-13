import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsNotEmpty } from 'class-validator'

export class ApproveProductDto {
    @IsArray()
    @IsNotEmpty()
    @ApiProperty({
        required: true,
    })
    products: []
}
