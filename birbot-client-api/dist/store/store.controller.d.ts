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
import { ActionService } from 'src/action/action.service';
import { UserService } from 'src/user/user.service';
import { CreateStorePhoneDto } from './dto/create-store-phone.dto';
import { CreateStoreDto } from './dto/create-store.dto';
import { SetStartOrStopDto } from './dto/set-start-or-stop.dto';
import { StartStopStoreDto } from './dto/start-stop-store.dto';
import { UpdateApiTokenDto } from './dto/update-api-token.dto';
import { UpdateDempingCityIdDto } from './dto/update-demping-city-id.dto';
import { UpdateStoreCredentialsDto } from './dto/update-store-credentials.dto';
import { UpdateStorePhoneDto } from './dto/update-store-phone.dto';
import { VerifyExistingStorePhoneDto, VerifyNewStorePhoneDto } from './dto/verify-store-phone.dto';
import { StoreV2Service } from './store-v2.service';
import { StoreService } from './store.service';
import { ReAuthStoreByPhone } from './dto/reAuthStoreByPhone.dto';
import { Response } from 'express';
import { UpdateStoreSlugDto } from './dto/update-store-slug.dto';
import { SetIsDempingOnLoanPeriod } from './dto/set-is-demping-on-loan-period';
import { UpdateStoreTaxRegimeDto } from './dto/update-store-tax-regime.dto';
export declare class StoreController {
    private readonly storeService;
    private readonly storeV2Service;
    private readonly actionService;
    private readonly userService;
    constructor(storeService: StoreService, storeV2Service: StoreV2Service, actionService: ActionService, userService: UserService);
    setIsDempingOnLoan(storeId: string, dto: SetIsDempingOnLoanPeriod): Promise<{
        isError: boolean;
        message: any;
    }>;
    showNYDiscount(userId: string): Promise<void>;
    setStartOrStop(storeId: string, dto: SetStartOrStopDto): Promise<void>;
    getStores(id: string, userId: string): Promise<any[]>;
    getStore(storeId: string, userId: string): Promise<any>;
    getStorePickupPoints(userId: string, storeId: string): Promise<(import("mongoose").Document<any, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("./kaspi-store-pickup-point.model").KaspiStorePickupPointModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & {
        _id: import("mongoose").Types.ObjectId;
    })[]>;
    getStoreStatistics(storeId: string, filter: string, userId: string): Promise<{
        topHighlyCompetitiveProducts: [];
        topLowMarginProducts: [];
        topMarginProducts: [];
        topSellingCities: any[];
        topSellingProducts: any[];
        sellingPerDay: {
            totalOrders: number;
            orders: {};
            profit: number;
            totalPrice: number;
            soldPerDay: string;
        };
        profit: number;
    }>;
    createTestStore(id: string): Promise<{
        message: string;
        storeId: import("mongoose").Types.ObjectId;
        storeName: string;
        productsCount: number;
    }>;
    createStore(dto: CreateStoreDto, id: string): Promise<import("mongoose").Document<import("mongoose").Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("./store.model").StoreModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    createStoreByPhone(dto: CreateStorePhoneDto, userId: string, res: Response): Promise<{
        token: string;
        ttlMs: number;
    }>;
    sendStoreCode(storeId: string, userId: string): Promise<void>;
    verifyPhoneNumber(dto: VerifyNewStorePhoneDto, userId: string): Promise<any>;
    reAuthStoreByPhone(dto: ReAuthStoreByPhone, userId: string): Promise<{
        token: string;
        ttlMs: number;
    }>;
    reVerifyPhoneNumber(dto: VerifyExistingStorePhoneDto, userId: string): Promise<{
        ok: boolean;
    }>;
    updateStartOrStop(storeId: string, userId: string, dto: StartStopStoreDto): Promise<void>;
    updateKaspiCredentials(storeId: string, userId: string, dto: UpdateStoreCredentialsDto): Promise<void>;
    updateMainCity(storeId: string, dto: UpdateDempingCityIdDto): Promise<{
        store: import("mongoose").Document<import("mongoose").Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("./store.model").StoreModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>;
        storeCity: import("mongoose").Document<import("mongoose").Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("../store-city/store-city.model").StoreCityModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>;
    }>;
    updateMainCityData(storeId: string, dto: UpdateDempingCityIdDto): Promise<{
        store: import("mongoose").Document<import("mongoose").Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("./store.model").StoreModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>;
    }>;
    updateApiToken(storeId: string, dto: UpdateApiTokenDto, userId: string): Promise<void>;
    updatePhoneNumber(dto: UpdateStorePhoneDto, storeId: string, userId: string): Promise<void>;
    loadFromKaspi(userId: string, storeId: string): Promise<{
        message: string;
    }>;
    getLoadProductsLastMessage(storeId: string): Promise<{
        messages: any[];
    }>;
    deleteLoadProductsLastMessage(storeId: string): Promise<void>;
    isAuthorized(storeId: string, userId: string): Promise<{
        isAuth: boolean;
    }>;
    getGeneralStats(filter: string, storeId: string, startDate?: Date, endDate?: Date): Promise<{
        filter: string;
        turnover: {
            value: any;
            percentageDifference: number;
        };
        averageAmountOfSells: {
            value: any;
            percentageDifference: number;
        };
        topCity: {
            value: any;
        };
        return: {
            value: any;
            percentageDifference: number;
        };
        amountOfSells: {
            value: any;
            percentageDifference: number;
        };
        profit: {
            value: number;
            percentageDifference: number;
            isPurchasePrice: boolean;
        };
        createdAt: Date;
    }>;
    getProfit(filter: string, storeId: string, startDate: Date, endDate: Date): Promise<{
        value: number;
        percentageDifference: number;
        isPurchasePrice: boolean;
    }>;
    getTopProducts(filter: string, storeId: string): Promise<any[]>;
    getTopMarginProducts(storeId: string): Promise<any[]>;
    getTopLowMarginProducts(storeId: string): Promise<any[]>;
    getChart(storeId: string, filter: string, startDate: Date, endDate: Date): Promise<{
        totalOrders: number;
        orders: {};
        profit: number;
        totalPrice: number;
        soldPerDay: string;
    }>;
    getPriceListExcel(storeId: string, filter: string, res: Response): Promise<void>;
    updateStpreSlug(dto: UpdateStoreSlugDto, storeId: string): Promise<import("mongodb").UpdateResult>;
    updateStoreTaxRegime(dto: UpdateStoreTaxRegimeDto, storeId: string): Promise<import("mongoose").Document<import("mongoose").Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("./store.model").StoreModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    getStoreSlug(storeId: string): Promise<import("mongoose").Document<import("mongoose").Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("./store-upload-limit.model").KaspiStoreUploadLimitModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    getNextXmlTime(storeId: string): Promise<Date>;
    loadOrdersFromKaspi(userId: string, storeId: string): Promise<{
        isError: boolean;
        message: string;
    } | {
        message: string;
        isError?: undefined;
    }>;
    getLoadOrdersLastMessage(storeId: string): Promise<{
        messages: any[];
    }>;
    deleteLoadOrdersLastMessage(storeId: string): Promise<void>;
}
