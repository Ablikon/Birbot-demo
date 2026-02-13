import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class UpdateMainCityProductDto {
    @IsString()
    @MinLength(1)
    @IsNotEmpty()
    id: string
}
