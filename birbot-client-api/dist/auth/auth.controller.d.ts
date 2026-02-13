/// <reference types="cookie-parser" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';
import { ActionService } from 'src/action/action.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegistrationDto } from './dto/registration.dto';
import { ResetPasswordDto } from './dto/reset.dto';
import { SetPasswordDto } from './dto/setPassword.dto';
import { VerifyDto } from './dto/verify.dto';
export declare class AuthController {
    private readonly authService;
    private readonly actionService;
    constructor(authService: AuthService, actionService: ActionService);
    registration(dto: RegistrationDto): Promise<{
        message: string;
    }>;
    login(dto: LoginDto, req: Request): Promise<{
        access_token: string;
    }>;
    verify(dto: VerifyDto, req: Request): Promise<{
        token: any;
        userId?: undefined;
    } | {
        token: string;
        userId: import("mongoose").Types.ObjectId;
    }>;
    reset(dto: ResetPasswordDto, req: Request): Promise<BadRequestException | {
        message: string;
        isError: boolean;
    }>;
    setPassword(dto: SetPasswordDto): Promise<{
        access_token: string;
    }>;
}
