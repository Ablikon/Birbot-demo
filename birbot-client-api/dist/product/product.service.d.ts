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
import { ModelType } from '@typegoose/typegoose/lib/types';
import { ProxyService } from 'src/proxy/proxy.service';
import { ProductModel } from './product.model';
import { StoreService } from 'src/store/store.service';
import { MarketplaceService } from 'src/marketplace/marketplace.service';
import { StoreCityService } from 'src/store-city/store-city.service';
import { KaspiService } from 'src/store/kaspi.service';
import { Types } from 'mongoose';
import { ProductChangeModel } from './product-change.model';
import { BonusChangeModel } from './bonus-change.model';
import { ApproveProductDto } from './dto/approve-product.dto';
import { MassUpdateProductsDto } from './dto/mass-update-product';
import { Queue } from 'bull';
import { Product } from './product';
import { KaspiProductAvailabilityOnPickupPointModel } from './kaspi-product-availability-on-pickup-point.model';
import { KaspiCategoryComissionService } from 'src/kaspi-category-comission/kaspi-category-comission.service';
import { KaspiPromotionService } from 'src/kaspi-promotion/kaspi-promotion.service';
import { ProductDeliveryDurationModel } from './product-delivery-duration.model';
import { ProductMerchantModel } from 'src/product-merchant/product-merchant.model';
import { ProductCityModel } from '../store-city/product-city.model';
import { KaspiStorePickupPointModel } from '../store/kaspi-store-pickup-point.model';
import { ChangePriceRequestResultModel } from './change-price-request-result.model';
import { ApproveProductForSaleHistoryModel } from './approve-product-for-sale-history.model';
import { GoldLinkedProductModel } from './gold-linked-product.model';
import { AnalyticsProductModel } from './analytics-product.model';
import { AnalyticsService } from 'src/analytics/analytics.service';
import { PrivilegedStoreService } from 'src/privileged-store/privileged-store.service';
export declare class ProductService {
    private readonly productModel;
    private readonly ProductCityModel;
    private readonly kaspiProductAvailabilityOnPickupPointModel;
    private readonly kaspiStorePickupPointModel;
    private readonly productChangeModel;
    private readonly analyticsProductModel;
    private readonly bonusChangeModel;
    private readonly productDeliveryDurationModel;
    private readonly productMerchantModel;
    private readonly changePriceRequestResultModel;
    private readonly approveProductForSaleHistoryModel;
    private readonly goldLinkedProductModel;
    private readonly pproxyService;
    private readonly storeService;
    private readonly marketplaceService;
    private readonly storeCityService;
    private readonly kaspiService;
    private readonly product;
    private readonly kaspiCategoryComissionService;
    private readonly kaspiPromotionService;
    private readonly analyticsService;
    private readonly privilegedStoreService;
    private actualizeProductMerchantsForProductQueue;
    private approveOrWithdrawProductQueue;
    private readonly dempingTasksForProductChangerManagerQueue;
    private readonly techRedisClient;
    constructor(productModel: ModelType<ProductModel>, ProductCityModel: ModelType<ProductCityModel>, kaspiProductAvailabilityOnPickupPointModel: ModelType<KaspiProductAvailabilityOnPickupPointModel>, kaspiStorePickupPointModel: ModelType<KaspiStorePickupPointModel>, productChangeModel: ModelType<ProductChangeModel>, analyticsProductModel: ModelType<AnalyticsProductModel>, bonusChangeModel: ModelType<BonusChangeModel>, productDeliveryDurationModel: ModelType<ProductDeliveryDurationModel>, productMerchantModel: ModelType<ProductMerchantModel>, changePriceRequestResultModel: ModelType<ChangePriceRequestResultModel>, approveProductForSaleHistoryModel: ModelType<ApproveProductForSaleHistoryModel>, goldLinkedProductModel: ModelType<GoldLinkedProductModel>, pproxyService: ProxyService, storeService: StoreService, marketplaceService: MarketplaceService, storeCityService: StoreCityService, kaspiService: KaspiService, product: Product, kaspiCategoryComissionService: KaspiCategoryComissionService, kaspiPromotionService: KaspiPromotionService, analyticsService: AnalyticsService, privilegedStoreService: PrivilegedStoreService, actualizeProductMerchantsForProductQueue: Queue, approveOrWithdrawProductQueue: Queue, dempingTasksForProductChangerManagerQueue: Queue);
    getProductByStoreIdAndMasterProductSku(masterProductSku: string, storeId: string): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & ProductModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    sleep(ms: number): Promise<unknown>;
    test(): Promise<void>;
    private isGoldLinkedProduct;
    getProductById(productId: string): Promise<any>;
    getCancelsMetric(id: string): Promise<any>;
    getActiveProductsCount(storeId: string): Promise<number>;
    getProductCount(storeId: string): Promise<{
        all: number;
        first: number;
        inChanging: number;
        minPriceAchieved: number;
        inMinus: number;
        dempOff: number;
        archive: number;
        dempOn: number;
        noCompetitors: number;
        waiting: number;
        activeProductsNoMinPrice: number;
        archiveProductsNoMinPrice: number;
        notSetMinPrice: number;
        newProducts: number;
        preOrder: number;
    }>;
    getProductsByStoreId(storeId: string, limit: number, page: number, query?: string, filter?: string, sortBy?: string, selectedCityId?: string): Promise<{
        data: any[];
        count: number;
        limit: number;
        page: number;
        total: number;
        filter: string;
        query: string;
    }>;
    private getFilterQuery;
    getAllProductsByStoreId(storeId: string): Promise<(import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & ProductModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getFilerProductsByStoreId(storeId: string, isActive?: boolean, isDemping?: boolean, limit?: number, skip?: number): Promise<(import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & ProductModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getProductBySku(sku: string): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & ProductModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    getProductStatistics(minusDay?: number): Promise<{
        total: number;
        demping: number;
        todayLoaded: number;
    }>;
    withdrawFromSale(products: string[], storeId: string): Promise<void>;
    private isAvailable;
    approve(storeId: string, dto: ApproveProductDto): Promise<void>;
    getProductByQuery(q: object, sort?: 1 | -1): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & ProductModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    getProductsByQuery(q: object, sort?: 1 | -1): Promise<(import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & ProductModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getProductsForMobileApp(userId: string, storeId: string): Promise<(import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & ProductModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getTopLowMarginProducts(storeId: string, limit?: number): Promise<any[]>;
    getTopMarginProducts(storeId: string, limit?: number): Promise<any[]>;
    getProductChangingStatistics(): Promise<{
        maxStoreInfo: {
            storeName: string;
            productCount: number;
            registrationDate: Date;
        };
        minStoreInfo: {
            storeName: string;
            productCount: number;
            registrationDate: Date;
        };
        length: number;
        toString(): string;
        toLocaleString(): string;
        pop(): any;
        push(...items: any[]): number;
        concat(...items: ConcatArray<any>[]): any[];
        concat(...items: any[]): any[];
        join(separator?: string): string;
        reverse(): any[];
        shift(): any;
        slice(start?: number, end?: number): any[];
        sort(compareFn?: (a: any, b: any) => number): any[];
        splice(start: number, deleteCount?: number): any[];
        splice(start: number, deleteCount: number, ...items: any[]): any[];
        unshift(...items: any[]): number;
        indexOf(searchElement: any, fromIndex?: number): number;
        lastIndexOf(searchElement: any, fromIndex?: number): number;
        every<S extends any>(predicate: (value: any, index: number, array: any[]) => value is S, thisArg?: any): this is S[];
        every(predicate: (value: any, index: number, array: any[]) => unknown, thisArg?: any): boolean;
        some(predicate: (value: any, index: number, array: any[]) => unknown, thisArg?: any): boolean;
        forEach(callbackfn: (value: any, index: number, array: any[]) => void, thisArg?: any): void;
        map<U>(callbackfn: (value: any, index: number, array: any[]) => U, thisArg?: any): U[];
        filter<S_1 extends any>(predicate: (value: any, index: number, array: any[]) => value is S_1, thisArg?: any): S_1[];
        filter(predicate: (value: any, index: number, array: any[]) => unknown, thisArg?: any): any[];
        reduce(callbackfn: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any): any;
        reduce(callbackfn: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any, initialValue: any): any;
        reduce<U_1>(callbackfn: (previousValue: U_1, currentValue: any, currentIndex: number, array: any[]) => U_1, initialValue: U_1): U_1;
        reduceRight(callbackfn: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any): any;
        reduceRight(callbackfn: (previousValue: any, currentValue: any, currentIndex: number, array: any[]) => any, initialValue: any): any;
        reduceRight<U_2>(callbackfn: (previousValue: U_2, currentValue: any, currentIndex: number, array: any[]) => U_2, initialValue: U_2): U_2;
        find<S_2 extends any>(predicate: (this: void, value: any, index: number, obj: any[]) => value is S_2, thisArg?: any): S_2;
        find(predicate: (value: any, index: number, obj: any[]) => unknown, thisArg?: any): any;
        findIndex(predicate: (value: any, index: number, obj: any[]) => unknown, thisArg?: any): number;
        fill(value: any, start?: number, end?: number): any[];
        copyWithin(target: number, start: number, end?: number): any[];
        entries(): IterableIterator<[number, any]>;
        keys(): IterableIterator<number>;
        values(): IterableIterator<any>;
        includes(searchElement: any, fromIndex?: number): boolean;
        flatMap<U_3, This = undefined>(callback: (this: This, value: any, index: number, array: any[]) => U_3 | readonly U_3[], thisArg?: This): U_3[];
        flat<A, D extends number = 1>(this: A, depth?: D): FlatArray<A, D>[];
        [Symbol.iterator](): IterableIterator<any>;
        [Symbol.unscopables](): {
            copyWithin: boolean;
            entries: boolean;
            fill: boolean;
            find: boolean;
            findIndex: boolean;
            keys: boolean;
            values: boolean;
        };
        at(index: number): any;
    }>;
    massUpdateProducts(userId: string, storeId: string, dto: MassUpdateProductsDto): Promise<void>;
    private addJobToQueueForProductChanger;
    checkActiveProductsLimit(storeId: Types.ObjectId, productsId?: string[]): Promise<void>;
    getProductImage(masterSku: string): Promise<string>;
    changeProductDeliveryDuration(storeId: string, productSku: string, updatedDeliveryDurations: string[]): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    getProductDeliveryDuration(storeId: string, productSku: string): Promise<"all" | (import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & ProductDeliveryDurationModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>)>;
    getProductsRequests(storeId: string): Promise<{
        products: {
            createdAt: any;
            type: any;
            name: any;
            url: any;
            sku: any;
            img: any;
        }[];
    }>;
    deleteProductDeliveryDuration(storeId: string, productSku: string): Promise<{
        success: boolean;
        message: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    changeManyProductDeliveryDuration(storeId: string, productSku: string[], updatedDeliveryDurations: string[]): Promise<{
        success: boolean;
        error: string;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    private hasBonusChanges;
    saveBonusChangeHistory(productId: string, storeId: string, sku: string, storeName: string, oldBonus?: number, newBonus?: number, oldMinBonus?: number, newMinBonus?: number, oldMaxBonus?: number, newMaxBonus?: number, oldIsBonusDemping?: boolean, newIsBonusDemping?: boolean, changeMethod?: 'MANUAL' | 'AUTO' | 'API', changedBy?: string): Promise<void>;
    getBonusChangeHistory(productId: string, limit?: number, page?: number): Promise<{
        data: (import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & BonusChangeModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
            _id: Types.ObjectId;
        }>)[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    updateGoldLinkStatus(storeId: string, productId: string, isLinked: boolean): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & GoldLinkedProductModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    deleteGoldLinkStatus(storeId: string, productId: string): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & GoldLinkedProductModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    getGoldLinkedProductsMap(storeId: string): Promise<Map<string, boolean>>;
}
