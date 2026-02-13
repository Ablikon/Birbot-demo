import { IsOptional, IsString } from 'class-validator'

export class UpdateOrderDto {
    @IsString()
    @IsOptional()
    comment?: string
}
