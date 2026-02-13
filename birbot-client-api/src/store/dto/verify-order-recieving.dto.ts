import { IsNotEmpty, IsString } from 'class-validator'

export class VerifyOrderRecievingDto {
    @IsString()
    @IsNotEmpty()
    orderId: string

    @IsString()
    @IsNotEmpty()
    pin: string
}
