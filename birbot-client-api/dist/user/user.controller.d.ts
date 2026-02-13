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
import { UserService } from './user.service';
import { UserReferralService } from './user-referral/user-referral.service';
import { UpdateUserNewFeatureDto } from './dto/new-feature.dto';
import { Message } from './dto/message.dto';
import { AcceptAgreementDto } from './dto/accept-agreement.dto';
import { Request } from 'express';
export declare class UserController {
    private readonly userService;
    private readonly userReferral;
    constructor(userService: UserService, userReferral: UserReferralService);
    getProfileInfo(userId: string): Promise<any>;
    getReferralCode(userId: string): Promise<string>;
    getReferrals(userId: string): Promise<{
        refCode: string;
        totalRefCount: number;
        totalIncome: number;
        monthlyRefCount: number;
        monthlyIncome: number;
        balance: number;
        referrals: {
            name: string;
            registrationDate: Date;
            income: number;
            used: boolean;
        }[];
    }>;
    getMoney(dto: Message): Promise<{
        success: boolean;
    }>;
    updateProfileInfo(userId: string, body: {
        cid: string;
    }): Promise<void>;
    updateProduct(UserId: string, dto: UpdateUserNewFeatureDto): Promise<void>;
    isHavePayments(phoneNumber: string): Promise<boolean>;
    getAgreement(userId: string): Promise<import("mongoose").Document<import("mongoose").Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("./user-agreement.model").UserAgreementModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    acceptAgreement(userId: string, dto: AcceptAgreementDto, req: Request): Promise<import("mongoose").Document<import("mongoose").Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("./user-agreement.model").UserAgreementModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
}
