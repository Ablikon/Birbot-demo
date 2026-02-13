import { IsString, Min } from 'class-validator'

export class UpdateStoreCredentialsDto {
    @IsString()
    login: string

    @IsString()
    password: string
}
