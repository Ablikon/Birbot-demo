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
import { StoreService } from 'src/store/store.service';
import { CreateStoreCityDto } from './dto/create-store-city.dto';
import { UpdateStoreCityDto } from './dto/update-store-city.dto';
import { StoreCityModel } from './store-city.model';
import { Types } from 'mongoose';
import { ProductCityModel } from './product-city.model';
import { ProductService } from 'src/product/product.service';
import { UpdateProductCityDto } from './dto/update-product-city.dto';
import { UpdateProductCitiesDto } from './dto/update-product-cities.dto';
import { ProductModel } from 'src/product/product.model';
import { Queue } from 'bull';
import { StoreModel } from 'src/store/store.model';
import { PrivilegedStoreService } from 'src/privileged-store/privileged-store.service';
export declare class StoreCityService {
    private readonly productModel;
    private readonly storeCityModel;
    private readonly productCityModel;
    private readonly storeService;
    private readonly productService;
    private readonly privilegedStoreService;
    private readonly actualizeProductMerchantsQueue;
    private actualizeProductMerchantsForProductQueue;
    private readonly actualizeStoreActiveProdutsHashQueue;
    private readonly redisClient;
    private readonly techRedisClient;
    constructor(productModel: ModelType<ProductModel>, storeCityModel: ModelType<StoreCityModel>, productCityModel: ModelType<ProductCityModel>, storeService: StoreService, productService: ProductService, privilegedStoreService: PrivilegedStoreService, actualizeProductMerchantsQueue: Queue, actualizeProductMerchantsForProductQueue: Queue, actualizeStoreActiveProdutsHashQueue: Queue);
    createStoreCity(dto: CreateStoreCityDto): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StoreCityModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    updateStoreCityData(storeCityId: string, dto: UpdateStoreCityDto): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StoreCityModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    updateProductCity(productCityId: string, dto: UpdateProductCityDto): Promise<void>;
    getStoreCities(storeId: string): Promise<(import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StoreCityModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    clearRedisStoresActiveProductsByCityId(store: StoreModel, cityId: string): Promise<void>;
    getStoreCity(storeId: string, cityId: string): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StoreCityModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    getProductCities(productId: string): Promise<any[]>;
    getStoreCityByQuery(q: object): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StoreCityModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    getProductCityByQuery(q: object): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & ProductCityModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    updateProductCities(dto: UpdateProductCitiesDto[]): Promise<void>;
    deleteStoreCity(storeCityId: string): Promise<void>;
    getAllProductCitiesForStore(storeId: string): Promise<(import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & ProductCityModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getProductCitiesByProductIds(productIds: string[]): Promise<import("mongoose").LeanDocument<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & ProductCityModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>[]>;
}
