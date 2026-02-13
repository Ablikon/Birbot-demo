import { IsString } from 'class-validator'

export class CreateStoreDto {
    @IsString()
    marketplaceId: string

    @IsString()
    login: string

    @IsString()
    password: string
}
