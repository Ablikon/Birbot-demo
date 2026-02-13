import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class UpdateApiTokenDto {
    @IsString()
    @MinLength(1)
    @IsNotEmpty()
    apiToken: string
}
