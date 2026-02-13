import { IsNotEmpty, IsPhoneNumber, IsString } from 'class-validator'

export class ReAuthStoreByPhone {
    @IsString()
    @IsNotEmpty()
    storeId: string

    @IsString()
    @IsPhoneNumber()
    @IsNotEmpty()
    phone: string
}
