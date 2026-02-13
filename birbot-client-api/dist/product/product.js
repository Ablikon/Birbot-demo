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
exports.Product = void 0;
const common_1 = require("@nestjs/common");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const product_model_1 = require("./product.model");
const mongoose_1 = require("mongoose");
const product_constant_1 = require("./product.constant");
const store_service_1 = require("../store/store.service");
const product_service_1 = require("./product.service");
const bull_1 = require("@nestjs/bull");
const store_city_service_1 = require("../store-city/store-city.service");
const kaspi_product_availability_on_pickup_point_model_1 = require("./kaspi-product-availability-on-pickup-point.model");
const product_merchant_service_1 = require("../product-merchant/product-merchant.service");
const redis_1 = require("redis");
const product_merchant_model_1 = require("../product-merchant/product-merchant.model");
const kaspi_marketing_constants_1 = require("../kaspi-marketing/kaspi-marketing.constants");
const kaspi_marketing_model_1 = require("../kaspi-marketing/kaspi-marketing.model");
const kaspi_marketing_service_1 = require("../kaspi-marketing/kaspi-marketing.service");
const store_constants_1 = require("../store/store.constants");
let Product = class Product {
    constructor(productModel, productMerchantModel, kaspiMarketingModel, kaspiProductAvailabilityOnPickupPointModel, storeService, productService, storeCityService, actualizeProductMerchantsForProductQueue, bonusChangerQueue, dempingTasksForPriceChangeManagerQueue, dempingTasksForPriceParserWithSuperHighPriorityQueue, dempingTasksForProductChangerQueue, dempingTasksForProductChangerManagerQueue, productsWithNewMinPriceQueue, dumpingTasksForPriceChangerQueue, changeProductPriceManuallyQueue, dumpingTasksForManuallyPriceChangeQueue, bonusProductStatusChanger, loadPeriodQueue, productMerchantService, kaspiMarkteingService) {
        this.productModel = productModel;
        this.productMerchantModel = productMerchantModel;
        this.kaspiMarketingModel = kaspiMarketingModel;
        this.kaspiProductAvailabilityOnPickupPointModel = kaspiProductAvailabilityOnPickupPointModel;
        this.storeService = storeService;
        this.productService = productService;
        this.storeCityService = storeCityService;
        this.actualizeProductMerchantsForProductQueue = actualizeProductMerchantsForProductQueue;
        this.bonusChangerQueue = bonusChangerQueue;
        this.dempingTasksForPriceChangeManagerQueue = dempingTasksForPriceChangeManagerQueue;
        this.dempingTasksForPriceParserWithSuperHighPriorityQueue = dempingTasksForPriceParserWithSuperHighPriorityQueue;
        this.dempingTasksForProductChangerQueue = dempingTasksForProductChangerQueue;
        this.dempingTasksForProductChangerManagerQueue = dempingTasksForProductChangerManagerQueue;
        this.productsWithNewMinPriceQueue = productsWithNewMinPriceQueue;
        this.dumpingTasksForPriceChangerQueue = dumpingTasksForPriceChangerQueue;
        this.changeProductPriceManuallyQueue = changeProductPriceManuallyQueue;
        this.dumpingTasksForManuallyPriceChangeQueue = dumpingTasksForManuallyPriceChangeQueue;
        this.bonusProductStatusChanger = bonusProductStatusChanger;
        this.loadPeriodQueue = loadPeriodQueue;
        this.productMerchantService = productMerchantService;
        this.kaspiMarkteingService = kaspiMarkteingService;
        this.techRedisClient = (0, redis_1.createClient)({
            url: process.env.TECH_REDIS_URL || '',
        });
        this.techRedisClient.connect().then(() => {
            console.log(`TECH REDIS CONNECTED`);
        });
    }
    async updateProduct(productId, dto) {
        if (!(0, mongoose_1.isValidObjectId)(productId)) {
            throw new common_1.NotFoundException(product_constant_1.PRODUCT_NOT_FOUND_ERROR);
        }
        const foundProduct = await this.productModel.findOne({ _id: productId });
        if (!foundProduct) {
            throw new common_1.NotFoundException(product_constant_1.PRODUCT_NOT_FOUND_ERROR);
        }
        const foundProductPrice = foundProduct.price;
        const store = await this.storeService.getStoreById(foundProduct.storeId.toString());
        if (!store) {
            throw new common_1.BadRequestException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        console.log(`[ > ] UPDATING PRODUCT | ${foundProduct.sku} | ${store.name} | ${new Date()}`);
        const masterSku = foundProduct.masterProduct.sku;
        const cityId = store.mainCity.id;
        await this.techRedisClient.del(`activeProductsByMasterSkuAndCityId:${masterSku}:${cityId}`);
        await this.techRedisClient.del(`kaspiProductAvailabilityOnPickupPoints:${productId}`);
        this.validatePrices(foundProduct, dto.availableMinPrice, dto.availableMaxPrice);
        if (dto.isDemping) {
            await this.checkActiveProductsLimit(foundProduct.storeId, [foundProduct._id.toString()]);
        }
        const updateQuery = Object.assign(Object.assign({}, dto), { isAutoRaise: dto.isAutoRaise });
        await this.productModel
            .updateOne({
            _id: productId,
        }, updateQuery)
            .then(async () => {
            await this.techRedisClient.del(`activeProducts:${masterSku}:${cityId}`);
            await this.techRedisClient.del(`productCities:${foundProduct._id}:${cityId}`);
            console.log(`[ > ] PRODUCT UPDATED | ${foundProduct.sku} | ${store.name} | ${new Date()}`);
        });
        try {
            await this.productService.saveBonusChangeHistory(productId, foundProduct.storeId.toString(), foundProduct.sku, store.name, foundProduct.bonus, dto.bonus, foundProduct.minBonus, dto.minBonus, foundProduct.maxBonus, dto.maxBonus, foundProduct.isBonusDemping, dto.isBonusDemping, 'MANUAL', null);
        }
        catch (error) {
            console.error(`[ ! ] ERROR SAVING BONUS CHANGE HISTORY | ${foundProduct.sku} | ${store.name} | ${new Date()}\n${error}`);
        }
        if (typeof dto.bonus === 'number' && dto.bonus !== foundProduct.bonus) {
            const kaspiMarketing = await this.kaspiMarketingModel.findOne({
                storeId: store._id
            });
            if (!kaspiMarketing) {
                throw new Error(kaspi_marketing_constants_1.KASPI_MARKETING_NOT_FOUND);
            }
            try {
                await this.bonusChangerQueue.add({
                    productId,
                    kaspiMarketingId: kaspiMarketing._id,
                    newBonus: dto.bonus
                }, {
                    removeOnFail: true,
                    removeOnComplete: true,
                });
                console.log("[ > ] ADDED TO BONUS CHANGER QUEUE", '|', foundProduct.sku, '|', new Date());
            }
            catch (e) {
                console.log(`[ ! ] ERROR ADDING PRODUCT IN BONUS CHANGER QUEUE ${foundProduct.sku} | ${store.name} | ${new Date()}\n${e}`);
            }
        }
        if (typeof dto.isBonusDemping === 'boolean' && dto.isBonusDemping) {
            try {
                const isDempingAvailable = await this.kaspiMarkteingService.isDempingAvailable(foundProduct.masterProduct.sku, store.mainCity.id);
                console.log('isDempingAvailable', isDempingAvailable);
                if (!isDempingAvailable) {
                    await this.productModel.updateOne({
                        _id: foundProduct._id
                    }, {
                        isBonusDemping: false
                    });
                    console.log("IS NOT AVAILABLE");
                    throw new Error('У товара нет единых цен — демпинг по бонусам невозможен');
                }
                const kaspiMarketing = await this.kaspiMarketingModel.findOne({
                    storeId: store._id
                });
                if (!kaspiMarketing) {
                    throw new Error(kaspi_marketing_constants_1.KASPI_MARKETING_NOT_FOUND);
                }
                await this.bonusProductStatusChanger.add({
                    productId: foundProduct._id.toString(),
                    kaspiMarketingId: kaspiMarketing._id.toString(),
                    status: 'Enabled'
                }, {
                    removeOnFail: true,
                    removeOnComplete: true
                });
                await this.productModel.updateOne({
                    _id: productId
                }, {
                    isDemping: false,
                    isAddedToBonusCampaign: true
                });
            }
            catch (e) {
                console.log(`[ ! ] ERROR ADDING PRODUCT IN BONUS CHANGER QUEUE ${foundProduct.sku} | ${store.name} | ${new Date()}\n${e}`);
                throw new common_1.BadRequestException('У товара нет единых цен — демпинг по бонусам невозможен');
            }
        }
        if (typeof dto.isBonusDemping === 'boolean' && !dto.isBonusDemping) {
            try {
                const kaspiMarketing = await this.kaspiMarketingModel.findOne({
                    storeId: store._id
                });
                if (!kaspiMarketing) {
                    throw new Error(kaspi_marketing_constants_1.KASPI_MARKETING_NOT_FOUND);
                }
                await this.productModel.updateOne({
                    _id: productId
                }, {
                    isDemping: false
                });
                await this.bonusProductStatusChanger.add({
                    productId: foundProduct._id.toString(),
                    kaspiMarketingId: kaspiMarketing._id.toString(),
                    status: 'paused'
                }, {
                    removeOnFail: true,
                    removeOnComplete: true
                });
            }
            catch (e) {
                console.log(`[ ! ] ERROR ADDING PRODUCT IN BONUS CHANGER QUEUE ${foundProduct.sku} | ${store.name} | ${new Date()}\n${e}`);
            }
        }
        if (typeof dto.loanPeriod === 'number' && dto.loanPeriod !== foundProduct.loanPeriod) {
            try {
                await this.loadPeriodQueue.add({ productId: productId }, {
                    removeOnComplete: true,
                    removeOnFail: true,
                    priority: 1
                });
                console.log(`[ > ] ADDED LOAN PERIOD UPDATE IN QUEUE | ${foundProduct.sku} | ${store.name} | ${new Date()}`);
            }
            catch (e) {
                console.error(`[ ! ] ERROR ADDING LOAN PERIOD UPDATE IN QUEUE ${foundProduct.sku} | ${store.name} | ${new Date()}\n${e}`);
            }
        }
        if (typeof dto.price === 'number' && dto.price !== foundProductPrice) {
            const storeCities = await this.storeCityService.getStoreCities(store._id.toString());
            try {
                const jobData = await this.getJobData(dto.cityId, foundProduct, storeCities, store, dto);
                await this.dumpingTasksForManuallyPriceChangeQueue.add(jobData, {
                    removeOnComplete: true,
                    removeOnFail: true,
                    priority: 1
                });
                console.log(`[ > ] ADDED NEW MANUAL PRICE CHANGE IN QUEUE | ${foundProduct.sku} | ${store.name} | ${new Date()}`);
            }
            catch (e) {
                console.error(`[ ! ] ERROR ADDING MANUAL PRICE CHANGE IN QUEUE ${foundProduct.sku} | ${store.name} | ${new Date()}\n${e}`);
            }
        }
        const currentMinPrice = foundProduct.availableMinPrice;
        if (typeof dto.availableMinPrice === 'number' && currentMinPrice !== dto.availableMinPrice) {
            this.productsWithNewMinPriceQueue.add({ productId: productId, storeId: store._id.toString() }, {
                removeOnComplete: true,
                removeOnFail: true,
                priority: 1,
            });
        }
        const minDifferentFromThanCurrentPrice = foundProduct.isActive && typeof dto.availableMinPrice === 'number' && foundProduct.availableMinPrice !== dto.availableMinPrice;
        await this.actualizeProductAvailabilitiesOnPickupPoints(store, foundProduct, dto.productWarehouses).catch((e) => {
            console.error(`[ ! ] ERROR UPDATING PRODUCT AVAILABILITIES | ${foundProduct.sku} | ${store.name} | ${new Date}\n${e}`);
        });
        if (minDifferentFromThanCurrentPrice || (dto.dempingPrice !== foundProduct.dempingPrice && foundProduct.place !== 1)) {
            try {
                const productMerchant = await this.productMerchantService.getProductMerchant(foundProduct.masterProduct.sku, store.mainCity.id);
                this.techRedisClient.del(`activeProducts:${foundProduct.masterProduct.sku}:${productMerchant.cityId}`);
                await this.productMerchantModel.updateOne({
                    masterProductSku: foundProduct.masterProduct.sku,
                    cityId: productMerchant.cityId
                }, {
                    $set: {
                        updatePeriod: 1,
                        "_nextUpdateDate": 0
                    }
                });
                if (productMerchant) {
                    this.dempingTasksForPriceParserWithSuperHighPriorityQueue
                        .add({
                        _id: productMerchant._id,
                        masterProductSku: productMerchant.masterProductSku,
                        cityId: productMerchant.cityId,
                        updatePeriod: 1,
                        productUrl: productMerchant.productUrl,
                        isX2Check: productMerchant.isX2Check,
                    }, {
                        removeOnComplete: true,
                        removeOnFail: true,
                        attempts: 20,
                        priority: 1,
                    })
                        .catch((e) => {
                        console.error(`[ ! ] ERROR ADDING PRODUCT DEMPING IN QUEUE ${foundProduct.sku} | ${store.name} | ${new Date()}\n${e}`);
                    });
                }
            }
            catch (e) {
                console.error(`[ ! ] ERROR ADDING PRODUCT DEMPING IN QUEUE ${foundProduct.sku} | ${store.name} | ${new Date()}\n${e}`);
            }
        }
        if (foundProduct.isActive && foundProduct.isDemping !== dto.isDemping) {
            await this.actualizeProductMerchantsForProductQueue
                .add({
                storeId: foundProduct.storeId,
                masterProductSku: foundProduct.masterProduct.sku,
                mainCity: store.mainCity,
                productUrl: foundProduct.url,
            }, {
                removeOnComplete: true,
                removeOnFail: false,
                priority: 1,
            })
                .catch((e) => {
                console.error(`[ ! ] ERROR ADDING PRODUCT ACTUALIZING IN QUEUE ${foundProduct.sku} | ${store.name} | ${new Date()}\n${e}`);
            });
        }
        const key = `requestLimitExceeded:${store.storeId}`;
        const data = await this.techRedisClient.get(key);
        if (data) {
            const parsedData = JSON.parse(data);
            return parsedData;
        }
        return;
    }
    async getJobData(cityId, product, storeCities, store, dto) {
        const selectedCity = product.cityPrices.find(data => data.cityId === dto.cityId);
        const priceChange = [{
                newPrice: dto.price,
                oldPrice: product.price,
                cityId: cityId,
            }];
        return {
            productMerchantId: product.merchantId.toString(),
            productId: product._id.toString(),
            productSku: product.sku,
            masterSku: product.masterProduct.sku,
            storeId: product.storeId.toString(),
            isDempingOnlyMainCity: product.isDempingOnlyMainCity,
            storeName: store.name,
            mainCityId: store.mainCity.id,
            productName: product.name,
            priceChange: priceChange,
            additionalCities: storeCities,
            productBrand: product.brand,
        };
    }
    async actualizeProductAvailabilitiesOnPickupPoints(store, product, productAvailabilityOnPickupPoints) {
        if (!Array.isArray(productAvailabilityOnPickupPoints)) {
            console.error("productAvailabilityOnPickupPoints is not an array");
            return;
        }
        const storePickupPoints = await this.storeService.getStorePickupPoints(store._id.toString());
        await Promise.all(productAvailabilityOnPickupPoints.map(async (productAvailabilityOnPickupPoint) => {
            const storePickupPoint = storePickupPoints.find((v) => v._id.toString() === productAvailabilityOnPickupPoint.storePickupPointId.toString());
            if (!storePickupPoint) {
                return;
            }
            else if (storePickupPoint.storeId.toString() !== product.storeId.toString()) {
                return;
            }
            const storePickupPointId = storePickupPoint._id;
            const productId = product._id;
            const collectionKey = `kaspiProductAvailabilityOnPickupPoints:${productId}`;
            const exists = await this.kaspiProductAvailabilityOnPickupPointModel.exists({
                storePickupPointId,
                productId,
            });
            if (exists) {
                await this.kaspiProductAvailabilityOnPickupPointModel.updateOne({
                    storePickupPointId,
                    productId,
                }, {
                    amount: productAvailabilityOnPickupPoint.amount,
                    preOrder: productAvailabilityOnPickupPoint.preOrder,
                    available: productAvailabilityOnPickupPoint.available,
                });
                const collectionData = await this.kaspiProductAvailabilityOnPickupPointModel.find({ productId });
                await this.techRedisClient.del(collectionKey);
                for (const item of collectionData) {
                    await this.techRedisClient.zAdd(collectionKey, { score: 0, value: JSON.stringify(item) });
                }
                await this.techRedisClient.expire(collectionKey, 2 * 60 * 60);
            }
            else {
                await new this.kaspiProductAvailabilityOnPickupPointModel({
                    storePickupPointId,
                    productId,
                    amount: productAvailabilityOnPickupPoint.amount,
                    preOrder: productAvailabilityOnPickupPoint.preOrder,
                    available: productAvailabilityOnPickupPoint.available,
                }).save();
                const collectionData = await this.kaspiProductAvailabilityOnPickupPointModel.find({ productId });
                await this.techRedisClient.del(collectionKey);
                for (const item of collectionData) {
                    await this.techRedisClient.zAdd(collectionKey, { score: 0, value: JSON.stringify(item) });
                }
                await this.techRedisClient.expire(collectionKey, 2 * 60 * 60);
            }
        }));
        if (product.isActive && store.expireDate > new Date()) {
            const foundProduct = await this.productModel.findOne({ _id: product._id });
            if (!foundProduct) {
                return;
            }
            await this.addJobToQueueForProductChanger(store, foundProduct);
        }
    }
    validatePrices(product, minPrice, maxPrice) {
        if (maxPrice && minPrice) {
            if (maxPrice < minPrice) {
                throw new common_1.BadRequestException(product_constant_1.MIN_AND_MAX_PRICE_ERROR);
            }
        }
        else if (maxPrice) {
            if (maxPrice < product.availableMinPrice) {
                throw new common_1.BadRequestException(product_constant_1.MIN_AND_MAX_PRICE_ERROR);
            }
        }
        else if (minPrice) {
            if (minPrice > product.availableMaxPrice) {
                throw new common_1.BadRequestException(product_constant_1.MIN_AND_MAX_PRICE_ERROR);
            }
        }
    }
    async addJobToQueueForProductChanger(store, product) {
        const storeCities = await this.storeCityService.getStoreCities(store._id.toString());
        const additionalCities = storeCities.map((v) => {
            return {
                _id: v._id,
                cityId: v.cityId,
            };
        });
        await this.dempingTasksForProductChangerManagerQueue.add({
            productId: product._id.toString(),
            storeId: store._id,
            additionalCities,
        }, {
            removeOnComplete: true,
            removeOnFail: true,
        });
        console.log(`ADDED TASK FOR PRODCUT CHANGE | ${product.sku} | ${store.name} | ${new Date()}`);
    }
    async checkActiveProductsLimit(storeId, productsId = []) {
        const query = {
            $or: [
                {
                    storeId,
                    isActive: true,
                    isDemping: true,
                },
            ],
        };
        const $or = [];
        for (const productId of productsId) {
            if (!(0, mongoose_1.isValidObjectId)(productId)) {
                continue;
            }
            query['$or'].push({
                _id: new mongoose_1.Types.ObjectId(productId),
            });
        }
        if ($or.length > 0) {
            query['$or'] = $or;
        }
        const maxActiveProductsLimit = await this.storeService.getStoreMaxDempingProducts(storeId.toString());
        const count = await this.productModel.count(query);
        if (maxActiveProductsLimit < count) {
            throw new common_1.BadRequestException(product_constant_1.MAX_DEMPING_PRODUCTS_ERROR);
        }
    }
};
Product = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_typegoose_1.InjectModel)(product_model_1.ProductModel)),
    __param(1, (0, nestjs_typegoose_1.InjectModel)(product_merchant_model_1.ProductMerchantModel)),
    __param(2, (0, nestjs_typegoose_1.InjectModel)(kaspi_marketing_model_1.KaspiMarketingModel)),
    __param(3, (0, nestjs_typegoose_1.InjectModel)(kaspi_product_availability_on_pickup_point_model_1.KaspiProductAvailabilityOnPickupPointModel)),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => store_service_1.StoreService))),
    __param(5, (0, common_1.Inject)((0, common_1.forwardRef)(() => product_service_1.ProductService))),
    __param(6, (0, common_1.Inject)((0, common_1.forwardRef)(() => store_city_service_1.StoreCityService))),
    __param(7, (0, bull_1.InjectQueue)('actualize-product-merchants-for-product-queue')),
    __param(8, (0, bull_1.InjectQueue)('bonus-changer-queue')),
    __param(9, (0, bull_1.InjectQueue)('dumping-tasks-for-dump-manager-queue')),
    __param(10, (0, bull_1.InjectQueue)('demping-tasks-for-price-parser-with-super-high-priority-queue')),
    __param(11, (0, bull_1.InjectQueue)('demping-tasks-for-product-changer-queue')),
    __param(12, (0, bull_1.InjectQueue)('demping-tasks-for-product-changer-manager-queue')),
    __param(13, (0, bull_1.InjectQueue)('products-with-new-min-price-queue')),
    __param(14, (0, bull_1.InjectQueue)('dumping-tasks-for-price-changer-queue')),
    __param(15, (0, bull_1.InjectQueue)('change-product-price-manually-queue')),
    __param(16, (0, bull_1.InjectQueue)('dumping-tasks-for-manually-price-change-manager-queue')),
    __param(17, (0, bull_1.InjectQueue)('bonus-product-status-changer-queue')),
    __param(18, (0, bull_1.InjectQueue)('loan-period-queue')),
    __param(19, (0, common_1.Inject)((0, common_1.forwardRef)(() => product_merchant_service_1.ProductMerchantService))),
    __param(20, (0, common_1.Inject)((0, common_1.forwardRef)(() => kaspi_marketing_service_1.KaspiMarketingService))),
    __metadata("design:paramtypes", [Object, Object, Object, Object, store_service_1.StoreService,
        product_service_1.ProductService,
        store_city_service_1.StoreCityService, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, product_merchant_service_1.ProductMerchantService,
        kaspi_marketing_service_1.KaspiMarketingService])
], Product);
exports.Product = Product;
//# sourceMappingURL=product.js.map