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
import { CreateStoreCityDto } from './dto/create-store-city.dto';
import { UpdateProductCitiesDto } from './dto/update-product-cities.dto';
import { UpdateProductCityDto } from './dto/update-product-city.dto';
import { UpdateStoreCityDto } from './dto/update-store-city.dto';
import { StoreCityService } from './store-city.service';
import { ActionService } from 'src/action/action.service';
export declare class StoreCityController {
    private readonly actionService;
    private readonly storeCityService;
    constructor(actionService: ActionService, storeCityService: StoreCityService);
    getProductCities(productId: string): Promise<any[]>;
    createStoreCity(dto: CreateStoreCityDto): Promise<import("mongoose").Document<import("mongoose").Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("./store-city.model").StoreCityModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    deleteStoreCity(storeCityId: string): Promise<void>;
    updateProductCity(productCityId: string, dto: UpdateProductCityDto): Promise<void>;
    updateProductCities(dto: UpdateProductCitiesDto[]): Promise<void>;
    updateStoreCityData(dto: UpdateStoreCityDto, storeCityId: string): Promise<import("mongoose").Document<import("mongoose").Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("./store-city.model").StoreCityModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    getStoreCities(storeId: string): Promise<(import("mongoose").Document<import("mongoose").Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("./store-city.model").StoreCityModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
}
