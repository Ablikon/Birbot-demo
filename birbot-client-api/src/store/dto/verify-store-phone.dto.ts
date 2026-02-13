import { IsNotEmpty, IsString, Length, Matches, IsMongoId } from 'class-validator'

// export class VerifyStorePhoneDto {
//     @IsString()
//     @IsNotEmpty()
//     storeId: string

//     @IsString()
//     @IsNotEmpty()
//     pin: string
// }

export class VerifyNewStorePhoneDto {
    @IsString()
    @IsNotEmpty()
    @Length(4, 6)
    @Matches(/^\d+$/, { message: 'PIN должен быть числом' })
    pin: string

    @IsString() 
    @IsNotEmpty() 
    token: string
}


export class VerifyExistingStorePhoneDto {
    @IsMongoId()
    @IsNotEmpty()
    storeId: string

    @IsString()
    @IsNotEmpty()
    @Length(4, 6)
    @Matches(/^\d+$/, { message: 'PIN должен быть числом' })
    pin: string

    @IsString()
    @IsNotEmpty()
    token: string
}