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
exports.StoreCityService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const store_service_1 = require("../store/store.service");
const store_city_model_1 = require("./store-city.model");
const mongoose_1 = require("mongoose");
const store_city_constants_1 = require("./store-city.constants");
const store_constants_1 = require("../store/store.constants");
const product_city_model_1 = require("./product-city.model");
const product_service_1 = require("../product/product.service");
const proxy_constants_1 = require("../proxy/proxy.constants");
const product_model_1 = require("../product/product.model");
const bull_1 = require("@nestjs/bull");
const redis_1 = require("redis");
const privileged_store_service_1 = require("../privileged-store/privileged-store.service");
let StoreCityService = class StoreCityService {
    constructor(productModel, storeCityModel, productCityModel, storeService, productService, privilegedStoreService, actualizeProductMerchantsQueue, actualizeProductMerchantsForProductQueue, actualizeStoreActiveProdutsHashQueue) {
        this.productModel = productModel;
        this.storeCityModel = storeCityModel;
        this.productCityModel = productCityModel;
        this.storeService = storeService;
        this.productService = productService;
        this.privilegedStoreService = privilegedStoreService;
        this.actualizeProductMerchantsQueue = actualizeProductMerchantsQueue;
        this.actualizeProductMerchantsForProductQueue = actualizeProductMerchantsForProductQueue;
        this.actualizeStoreActiveProdutsHashQueue = actualizeStoreActiveProdutsHashQueue;
        this.redisClient = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || '',
        });
        this.techRedisClient = (0, redis_1.createClient)({
            url: process.env.TECH_REDIS_URL || '',
        });
        this.redisClient.connect().then(() => {
            console.log(`REDIS IN STORE CITY SERVICE CONNECTED`);
        });
        this.techRedisClient.connect().then(() => {
            console.log("TECH REDIS IN STORE CITY SERVICE CONNECTED");
        });
    }
    async createStoreCity(dto) {
        if (!(0, mongoose_1.isValidObjectId)(dto.storeId)) {
            throw new common_1.BadRequestException(store_city_constants_1.INVALID_ID_ERROR);
        }
        const store = await this.storeService.getStoreById(dto.storeId);
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const isPrivilegedStore = await this.privilegedStoreService.isPrivileged(dto.storeId);
        const storeCitiesCount = await this.storeCityModel.count({
            storeId: dto.storeId,
        });
        if (!isPrivilegedStore) {
            if (storeCitiesCount >= store.cityLimit) {
                throw new common_1.BadRequestException(store_city_constants_1.MAX_STORE_CITY_ERROR);
            }
        }
        const city = await this.storeService.getCityById(dto.cityId);
        if (!city) {
            throw new common_1.BadRequestException(store_constants_1.INVALID_CITY_ID_ERROR);
        }
        if (store.mainCity.id === dto.cityId) {
            throw new common_1.BadRequestException(store_city_constants_1.ITS_SHOULD_BE_NOT_EQUAL_TO_MAIN_CITY_ERROR);
        }
        const storeCity = await this.storeCityModel.findOne({
            storeId: dto.storeId,
            cityId: dto.cityId,
        });
        if (storeCity) {
            throw new common_1.BadRequestException(store_city_constants_1.STORE_CITY_ALREADY_EXISTS_ERROR);
        }
        const newStoreCity = await new this.storeCityModel({
            storeId: dto.storeId,
            cityId: city.id,
            cityName: city.name,
            dempingCityId: city.id,
            isActive: true
        }).save();
        await this.redisClient.del(`storeCities:${dto.storeId}`);
        return newStoreCity;
    }
    async updateStoreCityData(storeCityId, dto) {
        if (!(0, mongoose_1.isValidObjectId)(storeCityId)) {
            throw new common_1.BadRequestException(store_city_constants_1.INVALID_ID_ERROR);
        }
        const storeCity = await this.storeCityModel.findOne({
            _id: storeCityId,
        });
        if (!storeCity) {
            throw new common_1.NotFoundException(store_city_constants_1.STORE_CITY_NOT_FOUND_ERROR);
        }
        const store = await this.storeService.getStoreById(storeCity.storeId.toString());
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const city = await this.storeService.getCityById(dto.cityId);
        if (dto.cityId) {
            if (!city) {
                throw new common_1.BadRequestException(store_constants_1.INVALID_CITY_ID_ERROR);
            }
        }
        const exist = await this.storeCityModel.findOne({
            storeId: storeCity.storeId,
            cityId: city.id
        });
        if (!exist || exist.isActive === true) {
            storeCity.cityId = (city === null || city === void 0 ? void 0 : city.id) || storeCity.cityId;
            storeCity.cityName = (city === null || city === void 0 ? void 0 : city.name) || storeCity.cityName;
            storeCity.dempingCityId = dto.dempingCityId || storeCity.dempingCityId || storeCity.cityId;
            await storeCity.save();
            await this.redisClient.del(`storeCities:${dto.storeId}`);
            await this.clearRedisStoresActiveProductsByCityId(store, dto.dempingCityId);
            return storeCity;
        }
        else {
            await this.storeCityModel.updateMany({ _id: { $in: [exist._id, storeCity._id] } }, [{ $set: { isActive: { $not: "$isActive" } } }]);
            return exist;
        }
    }
    async updateProductCity(productCityId, dto) {
        if (!(0, mongoose_1.isValidObjectId)(productCityId)) {
            throw new common_1.BadRequestException(store_city_constants_1.INVALID_ID_ERROR);
        }
        const productCity = await this.productCityModel.findOne({
            _id: productCityId,
        });
        if (!productCity) {
            throw new common_1.NotFoundException(store_city_constants_1.STORE_CITY_NOT_FOUND_ERROR);
        }
        productCity.availableMinPrice = dto.availableMinPrice;
        await productCity.save().catch((e) => {
            console.log('[^]' + ' store-city.sarvice ' + ' | ' + new Date() + ' | ' + '\n' + e);
        });
    }
    async getStoreCities(storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.BadRequestException(store_city_constants_1.INVALID_ID_ERROR);
        }
        return this.storeCityModel
            .find({
            storeId,
            isActive: true
        })
            .select({
            _id: 1,
            cityId: 1,
            cityName: 1,
            dempingCityId: 1,
            createdAt: 1,
        });
    }
    async clearRedisStoresActiveProductsByCityId(store, cityId) {
        const products = await this.productModel.find({ storeId: store._id, isDemping: true, isActive: true }, { "masterProduct.sku": 1 });
        await Promise.all(products.map(async (product) => {
            const key = `productCities:${product._id}:${cityId}`;
            await this.techRedisClient.del(key);
            await this.actualizeProductMerchantsForProductQueue
                .add({
                storeId: store._id,
                masterProductSku: product.masterProduct.sku,
                mainCity: store.mainCity,
                productUrl: product.url,
            }, {
                removeOnComplete: true,
                removeOnFail: false,
                priority: 1,
            })
                .catch((e) => {
                console.error(`[ ! ] ERROR ADDING PRODUCT ACTUALIZING IN QUEUE ${product.sku} | ${store.name} | ${new Date()}\n${e}`);
            });
        }));
        await this.actualizeStoreActiveProdutsHashQueue.add({
            storeId: store._id,
        }, {
            removeOnComplete: true,
            priority: 1,
            removeOnFail: true,
            jobId: `${store._id}`
        });
    }
    async getStoreCity(storeId, cityId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.BadRequestException(store_city_constants_1.INVALID_ID_ERROR);
        }
        return this.storeCityModel
            .findOne({
            storeId,
            cityId,
            isActive: true
        })
            .select({
            _id: 1,
            cityId: 1,
            cityName: 1,
            createdAt: 1,
            dempingCityId: 1,
        });
    }
    async getProductCities(productId) {
        if (!(0, mongoose_1.isValidObjectId)(productId)) {
            throw new common_1.BadRequestException(store_city_constants_1.INVALID_ID_ERROR);
        }
        const result = [];
        const product = await this.productService.getProductById(productId);
        if (!product) {
            console.log(`PRODUCT ID: ${productId}`);
            throw new common_1.NotFoundException(proxy_constants_1.PROXY_NOT_FOUND_ERROR);
        }
        const storeCities = await this.storeCityModel.find({
            storeId: product.storeId,
            isActive: true
        });
        for (const storeCity of storeCities) {
            const productCity = await this.productCityModel.findOne({
                storeCityId: storeCity._id.toString(),
                productId: product._id.toString(),
            });
            if (productCity) {
                result.push({
                    _id: productCity._id,
                    cityId: storeCity.cityId,
                    cityName: storeCity.cityName,
                    availableMinPrice: productCity.availableMinPrice,
                    availableMaxPrice: productCity.availableMaxPrice,
                    isDemping: productCity.isDemping,
                });
            }
            else {
                await new this.productCityModel({
                    storeCityId: storeCity._id,
                    productId: product._id,
                    availableMinPrice: product.availableMinPrice,
                })
                    .save()
                    .then((newProductCity) => {
                    result.push({
                        _id: newProductCity._id,
                        cityId: storeCity.cityId,
                        cityName: storeCity.cityName,
                        availableMinPrice: newProductCity.availableMinPrice,
                    });
                })
                    .catch((e) => {
                    console.log('[^]' + ' store-city.sarvice ' + ' | ' + new Date() + ' | ' + '\n' + e);
                });
            }
        }
        return result;
    }
    async getStoreCityByQuery(q) {
        return this.storeCityModel.findOne(q);
    }
    async getProductCityByQuery(q) {
        return this.productCityModel.findOne(q);
    }
    async updateProductCities(dto) {
        for (const productCity of dto) {
            if (!(0, mongoose_1.isValidObjectId)(productCity.productCityId)) {
                throw new common_1.NotFoundException();
            }
            const foundProductCity = await this.productCityModel.findOne({
                _id: productCity.productCityId,
            });
            if (!foundProductCity) {
                throw new common_1.NotFoundException();
            }
            if (productCity.availableMaxPrice < productCity.availableMinPrice) {
                throw new common_1.BadRequestException();
            }
            await this.productCityModel.updateOne({
                _id: productCity.productCityId,
            }, Object.assign(Object.assign({ availableMinPrice: productCity.availableMinPrice, availableMaxPrice: productCity.availableMaxPrice, isDemping: productCity.isDemping }, (productCity.dempingPrice !== undefined && { dempingPrice: productCity.dempingPrice })), (productCity.isAutoRaise !== undefined && { isAutoRaise: productCity.isAutoRaise })));
        }
    }
    async deleteStoreCity(storeCityId) {
        if (!(0, mongoose_1.isValidObjectId)(storeCityId)) {
            throw new common_1.NotFoundException();
        }
        await this.storeCityModel.deleteOne({ _id: storeCityId });
        await this.productCityModel.deleteMany({ storeCityId });
    }
    async getAllProductCitiesForStore(storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.BadRequestException(store_city_constants_1.INVALID_ID_ERROR);
        }
        const storeCities = await this.storeCityModel.find({ storeId });
        const storeCityIds = storeCities.map(c => c._id);
        return this.productCityModel.find({ storeCityId: { $in: storeCityIds } });
    }
    async getProductCitiesByProductIds(productIds) {
        return this.productCityModel
            .find({
            productId: { $in: productIds },
        })
            .lean();
    }
};
StoreCityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_typegoose_1.InjectModel)(product_model_1.ProductModel)),
    __param(1, (0, nestjs_typegoose_1.InjectModel)(store_city_model_1.StoreCityModel)),
    __param(2, (0, nestjs_typegoose_1.InjectModel)(product_city_model_1.ProductCityModel)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => store_service_1.StoreService))),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => product_service_1.ProductService))),
    __param(6, (0, bull_1.InjectQueue)('actualize-product-merchants-queue')),
    __param(7, (0, bull_1.InjectQueue)('actualize-product-merchants-for-product-queue')),
    __param(8, (0, bull_1.InjectQueue)('actualize-store-active-products-hash-queue')),
    __metadata("design:paramtypes", [Object, Object, Object, store_service_1.StoreService,
        product_service_1.ProductService,
        privileged_store_service_1.PrivilegedStoreService, Object, Object, Object])
], StoreCityService);
exports.StoreCityService = StoreCityService;
//# sourceMappingURL=store-city.service.js.map