import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class UpdateStoreSlugDto {
    @IsString()
    @MinLength(1)
    @IsNotEmpty()
    slug: string
}
