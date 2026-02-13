import { IsBoolean, IsNotEmpty } from 'class-validator'

export class SetIsDempingOnLoanPeriod {
    @IsBoolean()
    @IsNotEmpty()
    isDempingOnLoanPeriod: boolean

}
