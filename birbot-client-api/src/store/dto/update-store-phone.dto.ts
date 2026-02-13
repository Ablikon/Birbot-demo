import { IsNotEmpty, IsPhoneNumber } from 'class-validator'

export class UpdateStorePhoneDto {
    @IsPhoneNumber()
    @IsNotEmpty()
    phone: string
}
