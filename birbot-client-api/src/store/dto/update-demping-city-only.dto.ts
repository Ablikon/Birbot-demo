import { IsBoolean } from 'class-validator'

export class UpdateDempingCityOnlyDto {
    @IsBoolean()
    isDempingOnlyThisCity: boolean
}
