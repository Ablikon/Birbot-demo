import { IsString } from 'class-validator'

export class UpdateStoreDto {
    @IsString()
    login: string

    @IsString()
    password: string
}
