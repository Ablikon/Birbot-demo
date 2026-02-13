import { IsNumber, IsString, Min } from 'class-validator'

export class CreateProxyDto {
    login: string

    password: string

    @IsString()
    host: string

    @IsNumber()
    port: number
}
