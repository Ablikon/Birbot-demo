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
import { ModelType } from '@typegoose/typegoose/lib/types';
import { MarketplaceCityModel } from './marketplace-city.model';
export declare class CityService {
    private readonly marketplaceCityModel;
    constructor(marketplaceCityModel: ModelType<MarketplaceCityModel>);
    private scheduleTask;
    authenticateAndGetCities(): Promise<{
        id: any;
        name: any;
    }[]>;
    syncCitiesFromKaspi(): Promise<void>;
    getCities(marketplaceKey: string): Promise<{
        id: any;
        name: string;
    }[]>;
    getCity(marketplaceKey: string, id: string): Promise<import("mongoose").Document<import("mongoose").Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & MarketplaceCityModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    loadJmartCities(): Promise<void>;
    loadHalykmarketCities(): Promise<void>;
}
