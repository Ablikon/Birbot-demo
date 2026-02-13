import { IsOptional, IsString } from 'class-validator'

export class AcceptAgreementDto {
    @IsOptional()
    @IsString()
    userAgent?: string

    @IsOptional()
    clientInfo?: Record<string, any>
}

