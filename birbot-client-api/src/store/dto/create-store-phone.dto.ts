import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator'

export class CreateStorePhoneDto {
    @IsString()
    @IsNotEmpty()
    marketplaceId: string

    @IsString()
    @IsPhoneNumber()
    @IsNotEmpty()
    phone: string
}
