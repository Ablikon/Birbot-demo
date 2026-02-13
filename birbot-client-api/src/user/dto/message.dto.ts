import { ApiProperty } from "@nestjs/swagger"
import { IsBoolean, IsNumber, IsOptional, IsString,   } from "class-validator"

export class Message {
    @IsString()
    userId?: string

    @IsNumber()
    value?: number
}