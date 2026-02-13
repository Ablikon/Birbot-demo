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
/// <reference types="mongoose/types/inferschematype" />
import { ModelType, DocumentType } from '@typegoose/typegoose/lib/types';
import { Types } from 'mongoose';
import { RegistrationDto } from 'src/auth/dto/registration.dto';
import { NotVerifiedUserModel } from './not-verified-user.model';
import { UserModel } from './user.model';
import { UserReferralService } from './user-referral/user-referral.service';
import { UserCidHistoryModel } from './user-cid-history.model';
import { UpdateUserNewFeatureDto } from './dto/new-feature.dto';
import { StoreModel } from 'src/store/store.model';
import { UserAgreementModel } from './user-agreement.model';
import { AcceptAgreementDto } from './dto/accept-agreement.dto';
import { Request } from 'express';
export declare class UserService {
    private readonly userModel;
    private readonly storeModel;
    private readonly notVerifiedUserModel;
    private readonly userCidHistoryModel;
    private readonly userAgreementModel;
    private readonly userReferralService;
    constructor(userModel: ModelType<UserModel>, storeModel: ModelType<StoreModel>, notVerifiedUserModel: ModelType<NotVerifiedUserModel>, userCidHistoryModel: ModelType<UserCidHistoryModel>, userAgreementModel: ModelType<UserAgreementModel>, userReferralService: UserReferralService);
    launchCrons(): Promise<void>;
    getTodayUsers(): Promise<(import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & UserModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getExpressAnalyticsRequestCount(userId: string): Promise<number>;
    decreaseExpressAnalyticsRequestCount(userId: string): Promise<number>;
    getNotVerifiedUser(phone: string): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & NotVerifiedUserModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    saveNotVerifiedUserModel(dto: RegistrationDto): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & NotVerifiedUserModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    private getRandomToken;
    getNotVerifiedUserByToken(token: string): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & NotVerifiedUserModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    getAllUsers(): Promise<(import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & UserModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getAllTodayUsers(): Promise<(import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & UserModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    clearNotAllowerUsersByPhone(phone: string): Promise<void>;
    setPassword(phone: string, password: string, invalidateOldTokens?: boolean): Promise<{
        _id: Types.ObjectId;
    }>;
    deleteUser(userId: string): Promise<{
        userId: string;
    }>;
    findUserByEmail(email: string): Promise<DocumentType<UserModel>> | null;
    createUser(dto: RegistrationDto, leadId: number, contactId: number, facebook: {
        fbc?: string;
        fbp?: string;
    }): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & UserModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    updateIsRef(userId: string, value: boolean): Promise<void>;
    updateLeadIds(userId: string, leadId?: number, contactId?: number): Promise<void>;
    findUserById(id: string): Promise<DocumentType<UserModel>> | null;
    getUserStatistics(minusDay?: number): Promise<{
        total: number;
        todayRegistered: number;
    }>;
    searchUsersByKeyWord(keyword: string): Promise<import("mongoose").LeanDocument<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & UserModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>[]>;
    testUsed(userId: string): Promise<void>;
    giveNewStore(userId: string): Promise<void>;
    isBlocked(userId: string): Promise<boolean>;
    getProfileInfo(userId: string): Promise<any>;
    getAgreement(userId: string): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & UserAgreementModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    acceptUserAgreement(userId: string, dto: AcceptAgreementDto, req: Request): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & UserAgreementModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    private getClientIp;
    updateProfileInfo(userId: string, dto: {
        cid: string;
    }): Promise<void>;
    resetAcceptTokensAfterDate(userId: string): Promise<void>;
    updateUserNewFeatures(userId: string, dto: UpdateUserNewFeatureDto): Promise<void>;
    isHavePayments(phoneNumber: string): Promise<boolean>;
}
