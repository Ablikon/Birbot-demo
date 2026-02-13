import { IsNumber, Min } from 'class-validator'

export class AmountProductDto {
    @IsNumber()
    @Min(0)
    amount: number
}
