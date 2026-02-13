/// <reference types="multer" />
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
import { ProductService } from 'src/product/product.service';
import { StoreService } from 'src/store/store.service';
import { Types } from 'mongoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { StoreCityService } from 'src/store-city/store-city.service';
import { PriceListExampleModel } from './price-list-example.mode';
import { ProductItemPriceDto } from './dto/product-item-price.dto';
import { Product } from 'src/product/product';
import { StoreModel } from 'src/store/store.model';
import { StorePriceListUploadModel } from './store-price-list-upload.model';
import { Queue } from 'bull';
import { StorePriceListProductUpdateHistoryModel } from './store-price-list-product-update-history.model';
import { KaspiProductAvailabilityOnPickupPointModel } from 'src/product/kaspi-product-availability-on-pickup-point.model';
import { KaspiStorePickupPointModel } from 'src/store/kaspi-store-pickup-point.model';
export type KaspiXmlOfferPriceType = {
    cityId?: string;
    price: number;
};
export type KaspiXmlOfferAvailabilityType = {
    available: boolean;
    storeId: string;
    preOrder: number;
    stock?: number;
};
export type KaspiXmlOfferCityType = {
    cityId: string;
    availableMinPrice?: number;
    availableMaxPrice?: number;
    price?: number;
};
export type KaspiXmlOfferType = {
    model: string;
    brand: string;
    availabilities: KaspiXmlOfferAvailabilityType[];
    prices: KaspiXmlOfferPriceType[];
    sku: string;
};
export type KaspiXmlType = {
    company: string;
    merchantId: string;
    offers: KaspiXmlOfferType[];
};
export type KaspiExternalXmlOfferType = {
    model: string;
    brand: string;
    availabilities: KaspiXmlOfferAvailabilityType[];
    prices: KaspiXmlOfferPriceType[];
    minPrices?: KaspiXmlOfferPriceType[];
    maxPrices?: KaspiXmlOfferPriceType[];
    cities?: KaspiXmlOfferCityType[];
    isSetMinPrice?: number;
    archiveProtection?: number;
    autoacceptOrders?: number;
    sku: string;
    availableMinPrice?: number;
    availableMaxPrice?: number;
    purchasePrice?: number;
    isDemping?: number;
    isAutoRaise?: number;
    step?: number;
    withdrawIfEmptyStock?: number;
};
export type KaspiExternalXmlType = {
    company: string;
    merchantId: string;
    offers: KaspiExternalXmlOfferType[];
};
export declare class WarehouseService {
    private readonly storePriceListUploadModel;
    private readonly priceListExampleModel;
    private readonly storePriceListProductUpdateHistoryModel;
    private readonly kaspiProductAvailabilityOnPickupPointModel;
    private readonly KaspiStorePickupPointModel;
    private readonly storeModel;
    private readonly productService;
    private readonly product;
    private readonly storeService;
    private readonly storeCityService;
    private readonly updateProductFromPriceListQueue;
    private readonly loadSpecificKaspiProductQueue;
    private readonly actualizeProductAvailabilitiesAndSettingsFromExternalXmlQueue;
    private readonly techRedisClient;
    constructor(storePriceListUploadModel: ModelType<StorePriceListUploadModel>, priceListExampleModel: ModelType<PriceListExampleModel>, storePriceListProductUpdateHistoryModel: ModelType<StorePriceListProductUpdateHistoryModel>, kaspiProductAvailabilityOnPickupPointModel: ModelType<KaspiProductAvailabilityOnPickupPointModel>, KaspiStorePickupPointModel: ModelType<KaspiStorePickupPointModel>, storeModel: ModelType<StoreModel>, productService: ProductService, product: Product, storeService: StoreService, storeCityService: StoreCityService, updateProductFromPriceListQueue: Queue, loadSpecificKaspiProductQueue: Queue, actualizeProductAvailabilitiesAndSettingsFromExternalXmlQueue: Queue);
    private parseAvailability;
    private parseCity;
    private parseKaspiXmlToJson;
    uploadPriceList(file: Express.Multer.File, storeId: string): Promise<{
        id: Types.ObjectId;
    }>;
    updateProducts(products: ProductItemPriceDto[], storeId: string): Promise<void>;
    getExample(storeId: string): Promise<string>;
    sleep(ms: number): Promise<unknown>;
    generateExample(storeId: string, dto: {
        isActive?: boolean;
        isDemping?: boolean;
    }): Promise<void>;
    getPriceListExampleById(id: string): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & PriceListExampleModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    getLastPriceListExample(storeId: string): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & PriceListExampleModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    private readDataFromExcelFile;
    getKaspiPriceListHistory(storeId: string, page: number, limit?: number): Promise<{
        totalCount: number;
        data: any[];
    }>;
    getKaspiPriceListHistoryById(storeId: string, historyId: string): Promise<any>;
    getProductUpdateHistories(storeId: string, historyId: string, page: number, filter: string, query: string): Promise<{
        totalCount: number;
        data: (import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StorePriceListProductUpdateHistoryModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
            _id: Types.ObjectId;
        }>)[];
    }>;
}
