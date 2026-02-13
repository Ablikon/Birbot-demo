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
import { ProductService } from './product.service';
import { ActionService } from 'src/action/action.service';
import { ApproveProductDto } from './dto/approve-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { MassUpdateProductsDto } from './dto/mass-update-product';
import { UserService } from 'src/user/user.service';
import { Product } from './product';
import { ProductDeliveryDurationDto, ProductDeliveryDurationManyDto } from './dto/product-delivery-duration.dto';
export declare class ProductController {
    private readonly productService;
    private readonly product;
    private readonly actionService;
    private readonly userService;
    constructor(productService: ProductService, product: Product, actionService: ActionService, userService: UserService);
    getProductCountsByStoreId(storeId: string, userId: string): Promise<{
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
    getProductsByStoreId(limit: string, page: string, storeId: string, q: string, filter: string, sortBy: string, userId: string): Promise<{
        data: any[];
        count: number;
        limit: number;
        page: number;
        total: number;
        filter: string;
        query: string;
    }>;
    getProductsForMobileApp(userId: string, storeId: string): Promise<(import("mongoose").Document<import("mongoose").Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("./product.model").ProductModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    getCancelsMetric(id: string, userId: string): Promise<any>;
    getProductById(productId: string, userId: string): Promise<any>;
    updateProduct(productId: string, dto: UpdateProductDto, userId: string): Promise<any>;
    approve(storeId: string, userId: string, dto: ApproveProductDto): Promise<void>;
    withdrawFromSale(storeId: string, userId: string, dto: ApproveProductDto): Promise<void>;
    massUpdateProducts(userId: string, storeId: string, dto: MassUpdateProductsDto): Promise<void>;
    getProductDeliveryDurations(storeId: string, sku: string): Promise<"all" | (import("mongoose").Document<import("mongoose").Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("./product-delivery-duration.model").ProductDeliveryDurationModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: import("mongoose").Types.ObjectId;
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
    changeProductDeliveryDuration(storeId: string, dto: ProductDeliveryDurationDto): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    deleteProductDeliveryDuration(storeId: string, sku: string): Promise<{
        success: boolean;
        message: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
        message?: undefined;
    }>;
    changeManyProductDeliveryDuration(storeId: string, dto: ProductDeliveryDurationManyDto): Promise<{
        success: boolean;
        error: string;
        message?: undefined;
    } | {
        success: boolean;
        message: string;
        error?: undefined;
    }>;
    getBonusChangeHistory(productId: string, userId: string, limit?: number, page?: number): Promise<{
        data: (import("mongoose").Document<import("mongoose").Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("./bonus-change.model").BonusChangeModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
            _id: import("mongoose").Types.ObjectId;
        }>)[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    updateGoldLink(storeId: string, body: {
        productId: string;
        isLinked: boolean;
    }, userId: string): Promise<import("mongoose").Document<import("mongoose").Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("./gold-linked-product.model").GoldLinkedProductModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>>;
}
