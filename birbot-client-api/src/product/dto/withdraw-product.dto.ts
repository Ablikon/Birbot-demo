import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

export class WithdrawFromSaleDto {
    @IsBoolean()
    @ApiProperty({
        required: true,
    })
    isWithdrawFromSale: boolean
}
