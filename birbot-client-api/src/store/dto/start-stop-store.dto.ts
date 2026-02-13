import { IsBoolean } from 'class-validator'

export class StartStopStoreDto {
    @IsBoolean()
    value: boolean
}
