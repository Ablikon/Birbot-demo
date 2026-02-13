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
import { ProductService } from 'src/product/product.service';
import { StoreCityService } from 'src/store-city/store-city.service';
import { StoreService } from 'src/store/store.service';
import { PriceHistoryModel } from './price-history.model';
import { Types } from 'mongoose';
export declare class PriceHistoryService {
    private readonly priceHistoryModel;
    private readonly productService;
    private readonly storeService;
    private readonly storeCityService;
    constructor(priceHistoryModel: ModelType<PriceHistoryModel>, productService: ProductService, storeService: StoreService, storeCityService: StoreCityService);
    getPriceHistory(userId: string, storeId: string, productId: string): Promise<{
        history: (import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & PriceHistoryModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
            _id: Types.ObjectId;
        }>)[];
    }>;
    getTop5HighlyCompetitiveProducts(storeId: string): Promise<any[]>;
}
