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
import { MarketplaceService } from 'src/marketplace/marketplace.service';
import { UpdateStoreV2Dto } from './dto/update-store-v2.dto';
import { StoreModel } from './store.model';
import { Types } from 'mongoose';
import { MarketplaceCityModel } from 'src/city/marketplace-city.model';
export declare class StoreV2Service {
    private readonly storeModel;
    private readonly marketplaceService;
    private readonly marketplaceCityModel;
    constructor(storeModel: ModelType<StoreModel>, marketplaceService: MarketplaceService, marketplaceCityModel: ModelType<MarketplaceCityModel>);
    updateStoreFromController(storeId: string, userId: string, dto: UpdateStoreV2Dto): Promise<void>;
    updateStore(storeId: string, dto: UpdateStoreV2Dto): Promise<void>;
    getStoreOwner(storeId: string): Promise<string>;
    findOne(storeId: string): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & StoreModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    checkKaspiToken(): Promise<boolean>;
    checkRegistration(): Promise<void>;
}
