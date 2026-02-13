"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceHistoryService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const product_constant_1 = require("../product/product.constant");
const product_service_1 = require("../product/product.service");
const store_city_service_1 = require("../store-city/store-city.service");
const store_service_1 = require("../store/store.service");
const price_history_model_1 = require("./price-history.model");
const mongoose_1 = require("mongoose");
let PriceHistoryService = class PriceHistoryService {
    constructor(priceHistoryModel, productService, storeService, storeCityService) {
        this.priceHistoryModel = priceHistoryModel;
        this.productService = productService;
        this.storeService = storeService;
        this.storeCityService = storeCityService;
    }
    async getPriceHistory(userId, storeId, productId) {
        if (!(0, mongoose_1.isValidObjectId)(productId)) {
            throw new common_1.NotFoundException(product_constant_1.PRODUCT_NOT_FOUND_ERROR);
        }
        console.log(`search product | ${new Date()}`);
        const product = await this.productService.getProductById(productId);
        if (!product) {
            throw new common_1.NotFoundException(product_constant_1.PRODUCT_NOT_FOUND_ERROR);
        }
        console.log(`search history | ${new Date()}`);
        const history = await this.priceHistoryModel
            .find({
            storeId: product.storeId,
            sku: product.sku,
        })
            .sort({
            createdAt: -1,
        });
        console.log(`finished | ${new Date()}`);
        return {
            history,
        };
    }
    async getTop5HighlyCompetitiveProducts(storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            return [];
        }
        const aggregationResult = await this.priceHistoryModel.aggregate([
            {
                $match: {
                    storeId: new mongoose_1.Types.ObjectId(storeId),
                },
            },
            {
                $group: {
                    _id: '$sku',
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
            {
                $limit: 10,
            },
        ]);
        const result = [];
        for (const a of aggregationResult) {
            const product = await this.productService.getProductByQuery({
                sku: a._id,
                storeId,
            });
            if (product) {
                result.push({
                    _id: product._id,
                    count: a.count,
                    name: product.name,
                    url: product.url,
                    price: product.price,
                });
            }
        }
        return result;
    }
};
PriceHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_typegoose_1.InjectModel)(price_history_model_1.PriceHistoryModel)),
    __param(1, (0, common_1.Inject)((0, common_1.forwardRef)(() => product_service_1.ProductService))),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => store_service_1.StoreService))),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => store_city_service_1.StoreCityService))),
    __metadata("design:paramtypes", [Object, product_service_1.ProductService,
        store_service_1.StoreService,
        store_city_service_1.StoreCityService])
], PriceHistoryService);
exports.PriceHistoryService = PriceHistoryService;
//# sourceMappingURL=price-history.service.js.map