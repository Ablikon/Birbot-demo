import { ModelType } from '@typegoose/typegoose/lib/types';
import { MarketplaceService } from 'src/marketplace/marketplace.service';
import { UserService } from 'src/user/user.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { StartStopStoreDto } from './dto/start-stop-store.dto';
import { StoreModel } from './store.model';
import { StoreWAModel } from '../store-wa/store-wa.model';
import { StoreStateHistoryModel } from './store-state-history.model';
import mongoose, { Types } from 'mongoose';
import { UpdateStoreCredentialsDto } from './dto/update-store-credentials.dto';
import { UpdateDempingCityIdDto } from './dto/update-demping-city-id.dto';
import { UpdateDempingCityOnlyDto } from './dto/update-demping-city-only.dto';
import { StoreCityService } from 'src/store-city/store-city.service';
import { KaspiService } from './kaspi.service';
import { UpdateDempingPriceDto } from './dto/update-demping-price.dto';
import { OrderService } from 'src/order/order.service';
import { ProductService } from 'src/product/product.service';
import { PriceHistoryService } from 'src/price-history/price-history.service';
import { StoreStatisticsModel } from './store-statistics.model';
import { UpdateApiTokenDto } from './dto/update-api-token.dto';
import { StoreFinishModel } from './store-finish.model';
import { CreateStorePhoneDto } from './dto/create-store-phone.dto';
import { VerifyExistingStorePhoneDto, VerifyNewStorePhoneDto } from './dto/verify-store-phone.dto';
import { UpdateStorePhoneDto } from './dto/update-store-phone.dto';
import { ProductLoadQueueModel } from './product-load-queue.model';
import { ProductLoadQueueMessageModel } from './product-load-queue-message.model';
import { ProductLoadQueueSumModel } from './product-load-queue-sum.model';
import { StoreWaService } from 'src/store-wa/store-wa.service';
import { SetStartOrStopDto } from './dto/set-start-or-stop.dto';
import { Queue } from 'bull';
import { CityService } from 'src/city/city.service';
import { KaspiStorePickupPointModel } from './kaspi-store-pickup-point.model';
import { ReAuthStoreByPhone } from './dto/reAuthStoreByPhone.dto';
import { StorePositionMetricsModel } from './store-position-metrics.model';
import { Response } from 'express';
import { MarketplaceCityModel } from 'src/city/marketplace-city.model';
import { UpdateStoreSlugDto } from './dto/update-store-slug.dto';
import { KaspiStoreUploadLimitModel } from './store-upload-limit.model';
import { XmlUploadHistoryModel } from './xml-upload-history.model';
import { PaymentModel } from 'src/payment/payment.model';
import { OrderLoadQueueMessageModel } from './order-load-queue-message.model';
import { OrderLoadQueueSumModel } from './order-load-queue-sum.model';
import { OrderLoadQueueModel } from './order-load-queue.model';
import { SetIsDempingOnLoanPeriod } from './dto/set-is-demping-on-loan-period';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { IntegrationModel } from './integration.model';
export declare class StoreService {
    private readonly orderLoadQueue;
    private readonly orderLoadQueueMessage;
    private readonly orderLoadQueueSum;
    private readonly storeModel;
    private readonly storeStatisticsModel;
    private readonly productLoadQueue;
    private readonly productLoadQueueMessage;
    private readonly productLoadQueueSum;
    private readonly storeFinishModel;
    private readonly paymentModel;
    private readonly marketplaceCityModel;
    private readonly storePositionMetricsModel;
    private readonly xmlUploadHistoryModel;
    private readonly userService;
    private readonly marketplaceService;
    private readonly storeCityService;
    private readonly kaspiService;
    private readonly orderService;
    private readonly productService;
    private readonly priceHistoryService;
    private readonly kaspiStorePickupPointModel;
    private readonly storeWaService;
    private readonly kaspiStoreUploadLimitModel;
    private actualizeProductMerchantsForProductQueue;
    private loadProductsQueue;
    private readonly getKaspiStoreApiTokenQueue;
    private readonly actualizeKaspiStorePickupPointsQueue;
    private readonly loadKaspiActiveProductsClientQueue;
    private readonly loadKaspiActiveProductsByXmlQueue;
    private readonly loadKaspiArchiveProductsByXmlQueue;
    private readonly loadProductsFromXmlQueue;
    private readonly loadKaspiArchiveProductsQueue;
    private readonly actualizeProductMerchantsQueue;
    private readonly actualizeKaspiStoreCitiesQueue;
    private readonly clearXmlHashAndXmlHаshSumForStoreQueue;
    private readonly actualizeStoreActiveProdutsHashQueue;
    private readonly loadKaspiOrdersQueue;
    private readonly analyticsService;
    private readonly cityService;
    private readonly storeWaModel;
    private readonly storeStateHistoryModel;
    private readonly integrationModel;
    private readonly redisClient;
    private readonly techRedisClient;
    constructor(orderLoadQueue: ModelType<OrderLoadQueueModel>, orderLoadQueueMessage: ModelType<OrderLoadQueueMessageModel>, orderLoadQueueSum: ModelType<OrderLoadQueueSumModel>, storeModel: ModelType<StoreModel>, storeStatisticsModel: ModelType<StoreStatisticsModel>, productLoadQueue: ModelType<ProductLoadQueueModel>, productLoadQueueMessage: ModelType<ProductLoadQueueMessageModel>, productLoadQueueSum: ModelType<ProductLoadQueueSumModel>, storeFinishModel: ModelType<StoreFinishModel>, paymentModel: ModelType<PaymentModel>, marketplaceCityModel: ModelType<MarketplaceCityModel>, storePositionMetricsModel: ModelType<StorePositionMetricsModel>, xmlUploadHistoryModel: ModelType<XmlUploadHistoryModel>, userService: UserService, marketplaceService: MarketplaceService, storeCityService: StoreCityService, kaspiService: KaspiService, orderService: OrderService, productService: ProductService, priceHistoryService: PriceHistoryService, kaspiStorePickupPointModel: ModelType<KaspiStorePickupPointModel>, storeWaService: StoreWaService, kaspiStoreUploadLimitModel: ModelType<KaspiStoreUploadLimitModel>, actualizeProductMerchantsForProductQueue: Queue, loadProductsQueue: Queue, getKaspiStoreApiTokenQueue: Queue, actualizeKaspiStorePickupPointsQueue: Queue, loadKaspiActiveProductsClientQueue: Queue, loadKaspiActiveProductsByXmlQueue: Queue, loadKaspiArchiveProductsByXmlQueue: Queue, loadProductsFromXmlQueue: Queue, loadKaspiArchiveProductsQueue: Queue, actualizeProductMerchantsQueue: Queue, actualizeKaspiStoreCitiesQueue: Queue, clearXmlHashAndXmlHаshSumForStoreQueue: Queue, actualizeStoreActiveProdutsHashQueue: Queue, loadKaspiOrdersQueue: Queue, analyticsService: AnalyticsService, cityService: CityService, storeWaModel: ModelType<StoreWAModel>, storeStateHistoryModel: ModelType<StoreStateHistoryModel>, integrationModel: ModelType<IntegrationModel>);
    test(): Promise<void>;
    getStorePickupPoint(storeId: string, displayName: string): Promise<mongoose.Document<any, import("@typegoose/typegoose/lib/types").BeAnObject, any> & KaspiStorePickupPointModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & {
        _id: Types.ObjectId;
    }>;
    getStorePositionMetrics(startDate: Date, endDate: Date): Promise<any[]>;
    updateStoresData(): Promise<void>;
    getRandomStore(): Promise<mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StoreModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    getAllStores(): Promise<(mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StoreModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getMainCity(storeId: string): Promise<mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StoreModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    getActiveStores(): Promise<(mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StoreModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    updateStoreTaxRegime(storeId: string, taxRegime: number): Promise<mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StoreModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    getActiveStoresPaymentData(): Promise<{
        sumNotOverdue: number;
        notOverdue: number;
    }>;
    launchCrons(): Promise<void>;
    getStoresByUserIdForClient(userId: string): Promise<any[]>;
    getStoresByUserId(userId: string): Promise<any[]>;
    getStoreByUserId(userId: string, storeId: string): Promise<{
        store: mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StoreModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
            _id: Types.ObjectId;
        }>;
        marketplace: {
            _id: string;
            name: string;
            key: string;
            slug: string;
        };
        cities: (mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & MarketplaceCityModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
            _id: Types.ObjectId;
        }>)[];
        storeCities: (mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("../store-city/store-city.model").StoreCityModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
            _id: Types.ObjectId;
        }>)[];
    }>;
    getByMerchantId(merchantId: string): Promise<mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StoreModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    getStoreByIdForClient(id: string): Promise<any>;
    private getPrivilegedStoreQuery;
    getStoreById(id: string): Promise<mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StoreModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    createStore(dto: CreateStoreDto, userId: string): Promise<mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StoreModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    createTestStore(userId: string): Promise<{
        message: string;
        storeId: Types.ObjectId;
        storeName: string;
        productsCount: number;
    }>;
    sendStorePinCode(storeId: string): Promise<void>;
    createStorePhone(dto: CreateStorePhoneDto, userId: string): Promise<{
        token: string;
        ttlMs: number;
    }>;
    sleep(ms: number): Promise<unknown>;
    reAuthStoreByPhone(dto: ReAuthStoreByPhone): Promise<{
        token: string;
        ttlMs: number;
    }>;
    reVerifyPhoneNumber(dto: VerifyExistingStorePhoneDto): Promise<{
        ok: boolean;
    }>;
    verifyPhoneNumber(dto: VerifyNewStorePhoneDto, userId: string): Promise<{
        _id: Types.ObjectId;
        userId: Types.ObjectId;
    }>;
    updateStoreData(storeId: string): Promise<void>;
    updateStoreName(storeId: string): Promise<void>;
    deleteStore(storeId: string): Promise<void>;
    updateStartOrStop(dto: StartStopStoreDto, storeId: string, userId: string): Promise<void>;
    getStoreStatistics(minusDay?: number): Promise<{
        total: number;
        started: number;
        active: number;
        todayActivated: number;
        inTest: number;
    }>;
    getStoreConversions(minusDay?: number): Promise<{
        fromRegistrationToTestAll: string;
        fromRegistrationToTestToday: string;
        fromTestToPay: string;
        fromRegistrationToPay: string;
    }>;
    private formatPercent;
    updateExpireDate(storeId: string, newDate: Date, maxDempProducts: number, marketplaceId: string): Promise<void>;
    searchStoresByKeyword(keyword: string): Promise<any[]>;
    updateKaspiCredentials(userId: string, storeId: string, dto: UpdateStoreCredentialsDto): Promise<void>;
    updateMainCity(userId: string, storeId: string, dto: UpdateDempingCityIdDto): Promise<{
        store: mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StoreModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
            _id: Types.ObjectId;
        }>;
        storeCity: mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("../store-city/store-city.model").StoreCityModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
            _id: Types.ObjectId;
        }>;
    }>;
    updateMainCityData(userId: string, storeId: string, dto: UpdateDempingCityIdDto): Promise<{
        store: mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StoreModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
            _id: Types.ObjectId;
        }>;
    }>;
    updateDempingCityId(userId: string, storeId: string, dto: UpdateDempingCityIdDto): Promise<{
        cityId: string;
        cityName: string;
    }>;
    isValidCityId(cityId: string): Promise<boolean>;
    updateDempingOnlyThisCity(userId: string, storeId: string, dto: UpdateDempingCityOnlyDto): Promise<void>;
    getCityById(id: string): Promise<mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & MarketplaceCityModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    getCityIdByName(name: string): Promise<mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & MarketplaceCityModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    updateCookie(storeId: string, cookie: string): Promise<void>;
    giveNewCity(storeId: string): Promise<void>;
    updateDempingPrice(storeId: string, dto: UpdateDempingPriceDto): Promise<void>;
    setIsBadCredentials(store: StoreModel, value: boolean): Promise<void>;
    getCountOfApiTokens(): Promise<number>;
    calculateCabinetStatistics(storeId: string, startDateFromWeb?: Date, endDateFromWeb?: Date): Promise<void>;
    getProfitFromOrders(storeId: string, dateKey: string, startDateFromWeb?: Date, endDateFromWeb?: Date): Promise<number>;
    getStoreCabinetStatistics(storeId: string, filter?: string): Promise<{
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
    updateApiToken(storeId: string, dto: UpdateApiTokenDto): Promise<void>;
    getStoresByQuery(query: object): Promise<(mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StoreModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getStoreByQuery(query: object): Promise<mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StoreModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    getStoreFinishStatistics(storeId: string): Promise<{
        lastRecord: any;
        totalRound: number;
        avgTime: number;
        avgCountProducts: number;
    }>;
    updateCredentials(storeId: string, dto: UpdateStoreCredentialsDto): Promise<void>;
    getStorePickupPoints(storeId: string): Promise<(mongoose.Document<any, import("@typegoose/typegoose/lib/types").BeAnObject, any> & KaspiStorePickupPointModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & {
        _id: Types.ObjectId;
    })[]>;
    getStoreMaxDempingProducts(storeId: string): Promise<number>;
    updateStorePhoneNumber(userId: string, storeId: string, dto: UpdateStorePhoneDto): Promise<void>;
    loadProductsFromKaspi(userId: string, storeId: string): Promise<{
        message: string;
    }>;
    getLoadProductsLastMessage(storeId: string): Promise<{
        messages: any[];
    }>;
    deleteLoadProductsLastMessage(storeId: string): Promise<void>;
    isAuthorized(userId: string, storeId: string): Promise<{
        isAuth: boolean;
    }>;
    private notBought;
    private didNotRenewTheSubscriptionMonth;
    setStartOrStop(storeId: string, dto: SetStartOrStopDto): Promise<void>;
    getGeneralStats(storeId: string, filter: string, startDateFromWeb?: Date, endDateFromWeb?: Date): Promise<{
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
    getTopProducts(storeId: string, filter: string): Promise<any[]>;
    getTopMarginProducts(storeId: string): Promise<any[]>;
    getTopLowMarginProducts(storeId: string): Promise<any[]>;
    getChart(storeId: string, filter: string, startDateFromWeb: Date, endDateFromWeb: Date): Promise<{
        totalOrders: number;
        orders: {};
        profit: number;
        totalPrice: number;
        soldPerDay: string;
    }>;
    getProfit(storeId: string, filter: string, startDateFromWeb: Date, endDateFromWeb: Date): Promise<{
        value: number;
        percentageDifference: number;
        isPurchasePrice: boolean;
    }>;
    private getDateRangeByFilter;
    formatDashboardExcel(storeId: string, filter: string, res: Response): Promise<void>;
    getDashboardExcel(storeId: string, filter: string, res: Response): Promise<void>;
    showNYDiscount(userId: string): Promise<void>;
    updateStoreSlug(storeId: string, dto: UpdateStoreSlugDto): Promise<import("mongodb").UpdateResult>;
    getStoreUploadLimit(storeId: string): Promise<mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & KaspiStoreUploadLimitModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    setIsDempingOnLoanPeriod(storeId: string, dto: SetIsDempingOnLoanPeriod): Promise<{
        isError: boolean;
        message: any;
    }>;
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
    getTimeWhenNextXmlUpload(storeId: string): Promise<Date>;
}
