import { IsBoolean, IsNotEmpty, IsString } from 'class-validator'

export class SetStartOrStopDto {
    @IsBoolean()
    @IsNotEmpty()
    value: boolean

    @IsString()
    @IsNotEmpty()
    userId: string
}
