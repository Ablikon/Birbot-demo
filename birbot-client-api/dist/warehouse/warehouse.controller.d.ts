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
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { Response } from 'express';
import { WarehouseService } from './warehouse.service';
import { ActionService } from 'src/action/action.service';
import { UserService } from 'src/user/user.service';
export declare class WarehouseController {
    private readonly warehouseService;
    private readonly actionService;
    private readonly userService;
    constructor(warehouseService: WarehouseService, actionService: ActionService, userService: UserService);
    uploadKaspiPriceList(file: Express.Multer.File, storeId: string, userId: string): Promise<{
        id: import("mongoose").Types.ObjectId;
    }>;
    getKaspiPriceListHistory(storeId: string, userId: string, p: string, l: string): Promise<{
        totalCount: number;
        data: any[];
    }>;
    getKaspiPriceListHistoryById(storeId: string, historyId: string, userId: string): Promise<any>;
    getProductUpdateHistories(storeId: string, historyId: string, userId: string, page: string, filter: string, query: string): Promise<{
        totalCount: number;
        data: (import("mongoose").Document<import("mongoose").Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("./store-price-list-product-update-history.model").StorePriceListProductUpdateHistoryModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>)[];
    }>;
    generateExample(storeId: string, dto: {
        isActive?: boolean;
        isDemping: boolean;
    }, userId: string): Promise<void>;
    getLastExample(storeId: string, userId: string): Promise<import("mongoose").Document<import("mongoose").Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("./price-list-example.mode").PriceListExampleModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
    getExample(res: Response, id: string): Promise<void>;
}
