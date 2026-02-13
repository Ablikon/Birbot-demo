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
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const proxy_service_1 = require("../proxy/proxy.service");
const store_constants_1 = require("../store/store.constants");
const product_constant_1 = require("./product.constant");
const product_model_1 = require("./product.model");
const store_service_1 = require("../store/store.service");
const marketplace_service_1 = require("../marketplace/marketplace.service");
const store_city_service_1 = require("../store-city/store-city.service");
const kaspi_service_1 = require("../store/kaspi.service");
const mongoose_1 = require("mongoose");
const product_change_model_1 = require("./product-change.model");
const bonus_change_model_1 = require("./bonus-change.model");
const bull_1 = require("@nestjs/bull");
const product_1 = require("./product");
const kaspi_product_availability_on_pickup_point_model_1 = require("./kaspi-product-availability-on-pickup-point.model");
const kaspi_category_comission_service_1 = require("../kaspi-category-comission/kaspi-category-comission.service");
const kaspi_promotion_service_1 = require("../kaspi-promotion/kaspi-promotion.service");
const product_delivery_duration_model_1 = require("./product-delivery-duration.model");
const product_merchant_model_1 = require("../product-merchant/product-merchant.model");
const product_city_model_1 = require("../store-city/product-city.model");
const redis_1 = require("redis");
const kaspi_store_pickup_point_model_1 = require("../store/kaspi-store-pickup-point.model");
const change_price_request_result_model_1 = require("./change-price-request-result.model");
const approve_product_for_sale_history_model_1 = require("./approve-product-for-sale-history.model");
const gold_linked_product_model_1 = require("./gold-linked-product.model");
const analytics_product_model_1 = require("./analytics-product.model");
const analytics_service_1 = require("../analytics/analytics.service");
const privileged_store_service_1 = require("../privileged-store/privileged-store.service");
let ProductService = class ProductService {
    constructor(productModel, ProductCityModel, kaspiProductAvailabilityOnPickupPointModel, kaspiStorePickupPointModel, productChangeModel, analyticsProductModel, bonusChangeModel, productDeliveryDurationModel, productMerchantModel, changePriceRequestResultModel, approveProductForSaleHistoryModel, goldLinkedProductModel, pproxyService, storeService, marketplaceService, storeCityService, kaspiService, product, kaspiCategoryComissionService, kaspiPromotionService, analyticsService, privilegedStoreService, actualizeProductMerchantsForProductQueue, approveOrWithdrawProductQueue, dempingTasksForProductChangerManagerQueue) {
        this.productModel = productModel;
        this.ProductCityModel = ProductCityModel;
        this.kaspiProductAvailabilityOnPickupPointModel = kaspiProductAvailabilityOnPickupPointModel;
        this.kaspiStorePickupPointModel = kaspiStorePickupPointModel;
        this.productChangeModel = productChangeModel;
        this.analyticsProductModel = analyticsProductModel;
        this.bonusChangeModel = bonusChangeModel;
        this.productDeliveryDurationModel = productDeliveryDurationModel;
        this.productMerchantModel = productMerchantModel;
        this.changePriceRequestResultModel = changePriceRequestResultModel;
        this.approveProductForSaleHistoryModel = approveProductForSaleHistoryModel;
        this.goldLinkedProductModel = goldLinkedProductModel;
        this.pproxyService = pproxyService;
        this.storeService = storeService;
        this.marketplaceService = marketplaceService;
        this.storeCityService = storeCityService;
        this.kaspiService = kaspiService;
        this.product = product;
        this.kaspiCategoryComissionService = kaspiCategoryComissionService;
        this.kaspiPromotionService = kaspiPromotionService;
        this.analyticsService = analyticsService;
        this.privilegedStoreService = privilegedStoreService;
        this.actualizeProductMerchantsForProductQueue = actualizeProductMerchantsForProductQueue;
        this.approveOrWithdrawProductQueue = approveOrWithdrawProductQueue;
        this.dempingTasksForProductChangerManagerQueue = dempingTasksForProductChangerManagerQueue;
        this.techRedisClient = (0, redis_1.createClient)({
            url: process.env.TECH_REDIS_URL || '',
        });
        this.techRedisClient.connect().then(() => {
            console.log(`TECH REDIS IN PRODUCT SERVICE CONNECTED`);
        });
    }
    async getProductByStoreIdAndMasterProductSku(masterProductSku, storeId) {
        return this.productModel.findOne({
            storeId,
            'masterProduct.sku': masterProductSku,
        });
    }
    async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async test() {
        await this.sleep(1000);
        this.getProductCount('623bf069311277acd04d879c');
    }
    async isGoldLinkedProduct(masterProductSku) {
        try {
            const analyticsProduct = await this.analyticsProductModel.find({ sku: masterProductSku }).select({ _id: 1 }).lean();
            if (!analyticsProduct) {
                return false;
            }
            const isGoldConnected = await this.analyticsProductModel
                .aggregate([
                {
                    $match: {
                        sku: masterProductSku,
                    },
                },
                {
                    $match: {
                        characteristics: {
                            $elemMatch: {
                                features: {
                                    $all: [
                                        {
                                            $elemMatch: {
                                                name: 'Материал',
                                                value: { $elemMatch: { $regex: 'золото', $options: 'i' } },
                                            },
                                        },
                                        {
                                            $elemMatch: {
                                                name: 'Проба',
                                                value: { $in: ['585', '750', '999'] },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                },
                {
                    $project: { sku: 1, _id: 0 },
                },
            ])
                .exec();
            return isGoldConnected.length > 0;
        }
        catch (error) {
            console.error(`Error checking gold-linked product for SKU ${masterProductSku}:`, error);
            return false;
        }
    }
    async getProductById(productId) {
        var _a;
        if (!(0, mongoose_1.isValidObjectId)(productId)) {
            return null;
        }
        const products = await this.productModel.aggregate([
            {
                $match: {
                    _id: new mongoose_1.Types.ObjectId(productId),
                },
            },
            {
                $set: {
                    masterProductSku: '$masterProduct.sku',
                },
            },
            {
                $set: {
                    categoryCode: '$masterProduct.category',
                },
            },
            {
                $unset: ['masterProduct', 'lastUpdateDate', 'lastUpdatePrice', 'amount'],
            },
            {
                $lookup: {
                    from: 'ProductCity',
                    localField: '_id',
                    foreignField: 'productId',
                    as: 'productCities',
                    let: {
                        availableMinPrice: '$availableMinPrice',
                    },
                    pipeline: [
                        {
                            $lookup: {
                                from: 'StoreCity',
                                as: 'city',
                                foreignField: '_id',
                                localField: 'storeCityId',
                            },
                        },
                        {
                            $match: {
                                city: { $ne: [] },
                            },
                        },
                        {
                            $set: {
                                cityName: { $arrayElemAt: ['$city.cityName', 0] },
                            },
                        },
                        {
                            $set: {
                                cityId: { $arrayElemAt: ['$city.cityId', 0] },
                            },
                        },
                        {
                            $project: {
                                cityId: '$cityId',
                                cityName: '$cityName',
                                availableMinPrice: '$availableMinPrice',
                                availableMaxPrice: '$availableMaxPrice',
                                isDemping: '$isDemping',
                            },
                        },
                    ],
                },
            },
        ]);
        if (products.length === 0) {
            throw new common_1.NotFoundException();
        }
        const product = products[0];
        const masterProduct = await this.analyticsService.getProductBySku(product.masterProductSku);
        let categoryCode = ((product === null || product === void 0 ? void 0 : product.categoryCode) || '').replace('Master -', '').trim();
        let category = await this.kaspiCategoryComissionService.getCategoryByCode(categoryCode, false);
        if (!category) {
            categoryCode = (((_a = masterProduct === null || masterProduct === void 0 ? void 0 : masterProduct.category) === null || _a === void 0 ? void 0 : _a.code) || '').replace('Master -', '').trim();
            category = await this.kaspiCategoryComissionService.getCategoryByCode(categoryCode, false);
        }
        const categoryPromotion = await this.kaspiPromotionService.getPromotionCategory(categoryCode);
        const availabilitiesKey = `kaspiProductAvailabilityOnPickupPoints:${product._id}`;
        let availabilities = await this.techRedisClient.zRange(availabilitiesKey, 0, -1);
        if (availabilities.length > 0) {
            availabilities = availabilities.map((item) => {
                const parsedItem = JSON.parse(item);
                return {
                    storePickupPointId: parsedItem.storePickupPointId,
                    productId: parsedItem.productId,
                    available: parsedItem.available,
                    preOrder: parsedItem.preOrder,
                    amount: parsedItem.amount,
                };
            });
        }
        else {
            const availabilitiesFromDb = await this.kaspiProductAvailabilityOnPickupPointModel.find({ productId: product._id });
            availabilities = availabilitiesFromDb.map((availability) => ({
                storePickupPointId: availability.storePickupPointId,
                productId: availability.productId,
                available: availability.available,
                preOrder: availability.preOrder,
                amount: availability.amount,
            }));
            for (const availability of availabilitiesFromDb) {
                await this.techRedisClient.zAdd(availabilitiesKey, { score: 0, value: JSON.stringify(availability) });
            }
            await this.techRedisClient.expire(availabilitiesKey, 2 * 60 * 60);
        }
        return Object.assign(Object.assign({}, product), { availabilities, category: category
                ? {
                    title: category.title,
                    code: category.code,
                    comissionPercent: category.comissionStart,
                    comissionPercentOnPromotion: (categoryPromotion === null || categoryPromotion === void 0 ? void 0 : categoryPromotion.percent) || null,
                }
                : null, weight: (masterProduct === null || masterProduct === void 0 ? void 0 : masterProduct.weight) || 0 });
    }
    async getCancelsMetric(id) {
        const store = await this.storeService.getStoreById(id);
        const response = await fetch('https://mc.shop.kaspi.kz/mc/facade/graphql?opName=getCancelsMetric', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': store.cookie,
                'x-auth-version': '3',
            },
            body: JSON.stringify({
                operationName: 'getCancelsMetric',
                query: `
          query getCancelsMetric($id: String!) {
            merchant(id: $id) {
              qualityControl {
                cancelled {
                  details {
                    percentage
                    formulaElements {
                      numerator
                      denominator
                    }
                  }
                }
              }
            }
          }
        `,
                variables: { id },
            }),
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Kaspi API error: ${JSON.stringify(errorData)}`);
        }
        const data = await response.json();
        return data;
    }
    async getActiveProductsCount(storeId) {
        return this.productModel.count({
            storeId,
            isActive: true,
            isDemping: true,
        });
    }
    async getProductCount(storeId) {
        var _a;
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeService.getStoreById(storeId);
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const hasGoldFeature = (await this.techRedisClient.get(`featureStoreAccess:${storeId}:PRICE_CHANGE_ON_GOLD_RATE`)) === '1';
        if (store.expireDate < new Date() && !hasGoldFeature) {
            throw new common_1.NotFoundException(store_constants_1.STORE_EXPIRED_ERROR);
        }
        const todayDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
        const last24Hours = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
        const newProducts = await this.productModel.count({
            storeId,
            isActive: true,
            createdAt: {
                $gte: last24Hours,
            },
        });
        let preOrderCount = 0;
        const preOrder = await this.productModel.aggregate([
            {
                $match: {
                    storeId: new mongoose_1.Types.ObjectId(storeId),
                    isActive: true,
                },
            },
            {
                $lookup: {
                    from: 'KaspiProductAvailabilityOnPickupPoint',
                    localField: '_id',
                    foreignField: 'productId',
                    as: 'availability',
                },
            },
            {
                $unwind: '$availability',
            },
            {
                $match: {
                    'availability.preOrder': { $gt: 0 },
                },
            },
            {
                $project: {
                    _id: 0,
                    productId: '$_id',
                    storeId: 1,
                    availability: '$availability',
                },
            },
            {
                $group: {
                    _id: '$productId',
                    count: { $sum: 1 },
                },
            },
            {
                $count: 'total',
            },
        ]);
        if (Array.isArray(preOrder) && preOrder.length > 0) {
            preOrderCount = (_a = preOrder[0]) === null || _a === void 0 ? void 0 : _a.total;
        }
        return {
            all: await this.productModel.count({
                storeId,
                isActive: true,
            }),
            first: await this.productModel.count({
                storeId,
                isActive: true,
                place: 1,
                isDemping: true,
                isMinus: false,
            }),
            inChanging: await this.productModel.count({
                storeId,
                isActive: true,
                isChanging: true,
                isDemping: true,
                place: {
                    $ne: 1,
                },
                isMinus: false,
            }),
            minPriceAchieved: await this.productModel.count({
                storeId,
                isDemping: true,
                isActive: true,
                $expr: { $eq: ['$availableMinPrice', '$price'] },
            }),
            inMinus: await this.productModel.count({
                storeId,
                isActive: true,
                isMinus: true,
                isDemping: true,
            }),
            dempOff: await this.productModel.count({
                storeId,
                isActive: true,
                isDemping: false,
            }),
            archive: await this.productModel.count({
                storeId,
                isActive: false,
            }),
            dempOn: await this.productModel.count({
                storeId,
                isActive: true,
                isDemping: true,
            }),
            noCompetitors: await this.productModel.count({
                storeId,
                isActive: true,
                isDemping: true,
                offersCount: 1,
            }),
            waiting: await this.productModel.count({
                storeId,
                isActive: true,
                isDemping: true,
                isChanging: false,
                place: {
                    $ne: 1,
                },
                isMinus: false,
            }),
            activeProductsNoMinPrice: await this.productModel.count({
                storeId,
                isActive: true,
                availableMinPrice: 0,
            }),
            archiveProductsNoMinPrice: await this.productModel.count({
                storeId,
                isActive: false,
                availableMinPrice: 0,
            }),
            notSetMinPrice: await this.productModel.count({
                storeId,
                isActive: true,
                isSetMinPrice: false,
            }),
            newProducts,
            preOrder: preOrderCount,
        };
    }
    async getProductsByStoreId(storeId, limit, page, query = '', filter = 'all', sortBy = '', selectedCityId = '') {
        var _a;
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeService.getStoreById(storeId);
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const hasGoldFeature = (await this.techRedisClient.get(`featureStoreAccess:${storeId}:PRICE_CHANGE_ON_GOLD_RATE`)) === '1';
        if (store.expireDate < new Date() && !hasGoldFeature) {
            throw new common_1.NotFoundException(store_constants_1.STORE_EXPIRED_ERROR);
        }
        const escapeRegExp = (string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };
        const escapedQuery = escapeRegExp(query);
        const q = Object.assign(Object.assign({ isActive: true, storeId: new mongoose_1.Types.ObjectId(storeId) }, this.getFilterQuery(filter)), { $and: [
                {
                    $or: [
                        {
                            sku: {
                                $regex: escapedQuery || '',
                                $options: 'i',
                            },
                        },
                        {
                            name: {
                                $regex: escapedQuery || '',
                                $options: 'i',
                            },
                        },
                        {
                            masterProduct: {
                                sku: {
                                    $regex: escapedQuery || '',
                                    $options: 'i',
                                },
                            },
                        },
                    ],
                },
                selectedCityId
                    ? {
                        $or: [
                            {
                                newCityData: {
                                    $elemMatch: {
                                        id: selectedCityId,
                                    },
                                },
                            },
                            {
                                cityData: {
                                    $elemMatch: {
                                        id: selectedCityId,
                                    },
                                },
                            },
                        ],
                    }
                    : {},
            ] });
        let sort = {
            kaspiCabinetPosition: 1,
        };
        if (sortBy) {
            if (sortBy === 'asc') {
                sort = {
                    name: 1,
                };
            }
            else if (sortBy === 'desc') {
                sort = {
                    name: -1,
                };
            }
        }
        if (filter === 'minus') {
            sort = {
                place: 1,
            };
        }
        if (filter === 'min-price-achieved') {
            sort = {
                place: 1,
            };
        }
        const skip = (page - 1) * limit;
        let products = [];
        if (filter === 'preorder') {
            products = await this.productModel.aggregate([
                {
                    $match: q,
                },
                {
                    $sort: sort,
                },
                {
                    $skip: skip,
                },
                {
                    $set: {
                        masterProductSku: '$masterProduct.sku',
                    },
                },
                {
                    $lookup: {
                        from: 'KaspiProductAvailabilityOnPickupPoint',
                        as: 'availabilities',
                        localField: '_id',
                        foreignField: 'productId',
                    },
                },
                {
                    $lookup: {
                        from: 'ProductCity',
                        as: 'productCities',
                        localField: '_id',
                        foreignField: 'productId',
                    },
                },
                {
                    $unwind: {
                        path: '$productCities',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: 'StoreCity',
                        localField: 'productCities.storeCityId',
                        foreignField: '_id',
                        as: 'storeCityInfo',
                    },
                },
                {
                    $unwind: {
                        path: '$storeCityInfo',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $set: {
                        'productCities.cityId': '$storeCityInfo.cityId',
                    },
                },
                {
                    $group: {
                        _id: '$_id',
                        name: { $first: '$name' },
                        price: { $first: '$price' },
                        availableMinPrice: { $first: '$availableMinPrice' },
                        availableMaxPrice: { $first: '$availableMaxPrice' },
                        img: { $first: '$img' },
                        dempingPrice: { $first: '$dempingPrice' },
                        isAutoRaise: { $first: '$isAutoRaise' },
                        isMinus: { $first: '$isMinus' },
                        isChanging: { $first: '$isChanging' },
                        place: { $first: '$place' },
                        masterProductSku: { $first: '$masterProductSku' },
                        purchasePrice: { $first: '$purchasePrice' },
                        firstPlacePrice: { $first: '$firstPlacePrice' },
                        sku: { $first: '$sku' },
                        isActive: { $first: '$isActive' },
                        isDemping: { $first: '$isDemping' },
                        url: { $first: '$url' },
                        availabilities: { $first: '$availabilities' },
                        cityPrices: { $push: '$productCities' },
                        loanPeriod: { $first: '$loanPeriod' },
                        bonus: { $first: '$bonus' },
                        minBonus: { $first: '$minBonus' },
                        maxBonus: { $first: '$maxBonus' },
                        isBonusDemping: { $first: '$isBonusDemping' },
                    },
                },
                {
                    $addFields: {
                        bonus: { $ifNull: ['$bonus', 5] },
                        minBonus: { $ifNull: ['$minBonus', 5] },
                        maxBonus: { $ifNull: ['$maxBonus', 60] },
                        isBonusDemping: { $ifNull: ['$isBonusDemping', false] },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        price: 1,
                        availableMinPrice: 1,
                        availableMaxPrice: 1,
                        img: 1,
                        dempingPrice: 1,
                        isAutoRaise: 1,
                        isMinus: 1,
                        isChanging: 1,
                        place: 1,
                        masterProductSku: 1,
                        purchasePrice: 1,
                        firstPlacePrice: 1,
                        sku: 1,
                        isActive: 1,
                        isDemping: 1,
                        url: 1,
                        availabilities: 1,
                        cityPrices: 1,
                        productCities: 1,
                        loanPeriod: 1,
                        bonus: 1,
                        minBonus: 1,
                        maxBonus: 1,
                        isBonusDemping: 1,
                    },
                },
                {
                    $match: {
                        'availabilities.preOrder': { $gt: 0 }
                    }
                },
                {
                    $limit: limit,
                },
            ]);
        }
        else {
            products = await this.productModel.aggregate([
                {
                    $match: q
                },
                {
                    $sort: sort,
                },
                {
                    $skip: skip,
                },
                {
                    $limit: limit,
                },
                {
                    $set: {
                        masterProductSku: '$masterProduct.sku',
                    },
                },
                {
                    $lookup: {
                        from: 'KaspiProductAvailabilityOnPickupPoint',
                        as: 'availabilities',
                        localField: '_id',
                        foreignField: 'productId',
                    },
                },
                {
                    $lookup: {
                        from: 'ProductCity',
                        as: 'productCities',
                        localField: '_id',
                        foreignField: 'productId',
                    },
                },
                {
                    $unwind: {
                        path: '$productCities',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $lookup: {
                        from: 'StoreCity',
                        localField: 'productCities.storeCityId',
                        foreignField: '_id',
                        as: 'storeCityInfo',
                    },
                },
                {
                    $unwind: {
                        path: '$storeCityInfo',
                        preserveNullAndEmptyArrays: true,
                    },
                },
                {
                    $set: {
                        'productCities.cityId': '$storeCityInfo.cityId',
                    },
                },
                {
                    $group: {
                        _id: '$_id',
                        name: { $first: '$name' },
                        price: { $first: '$price' },
                        availableMinPrice: { $first: '$availableMinPrice' },
                        availableMaxPrice: { $first: '$availableMaxPrice' },
                        img: { $first: '$img' },
                        dempingPrice: { $first: '$dempingPrice' },
                        isAutoRaise: { $first: '$isAutoRaise' },
                        isMinus: { $first: '$isMinus' },
                        isChanging: { $first: '$isChanging' },
                        place: { $first: '$place' },
                        masterProductSku: { $first: '$masterProductSku' },
                        purchasePrice: { $first: '$purchasePrice' },
                        firstPlacePrice: { $first: '$firstPlacePrice' },
                        sku: { $first: '$sku' },
                        isActive: { $first: '$isActive' },
                        isDemping: { $first: '$isDemping' },
                        url: { $first: '$url' },
                        availabilities: { $first: '$availabilities' },
                        cityPrices: { $first: '$cityPrices' },
                        productCities: { $push: '$productCities' },
                        kaspiCabinetPosition: { $first: '$kaspiCabinetPosition' },
                        loanPeriod: { $first: '$loanPeriod' },
                        bonus: { $first: '$bonus' },
                        minBonus: { $first: '$minBonus' },
                        maxBonus: { $first: '$maxBonus' },
                        isBonusDemping: { $first: '$isBonusDemping' },
                    },
                },
                {
                    $addFields: {
                        bonus: { $ifNull: ['$bonus', 5] },
                        minBonus: { $ifNull: ['$minBonus', 5] },
                        maxBonus: { $ifNull: ['$maxBonus', 60] },
                        isBonusDemping: { $ifNull: ['$isBonusDemping', false] },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        name: 1,
                        price: 1,
                        availableMinPrice: 1,
                        availableMaxPrice: 1,
                        img: 1,
                        dempingPrice: 1,
                        isAutoRaise: 1,
                        isMinus: 1,
                        isChanging: 1,
                        place: 1,
                        masterProductSku: 1,
                        purchasePrice: 1,
                        firstPlacePrice: 1,
                        sku: 1,
                        isActive: 1,
                        isDemping: 1,
                        url: 1,
                        availabilities: 1,
                        cityPrices: 1,
                        productCities: 1,
                        kaspiCabinetPosition: 1,
                        loanPeriod: 1,
                        bonus: 1,
                        minBonus: 1,
                        maxBonus: 1,
                        isBonusDemping: 1,
                    },
                },
                {
                    $sort: sort,
                },
            ]);
        }
        const data = [];
        const masterProductSkus = products.map((p) => p.masterProductSku).filter(Boolean);
        const manualGoldSettings = await this.getGoldLinkedProductsMap(storeId);
        const goldProductsMap = new Map();
        if (masterProductSkus.length > 0) {
            try {
                const goldProducts = await this.analyticsProductModel
                    .aggregate([
                    {
                        $match: {
                            sku: { $in: masterProductSkus },
                        },
                    },
                    {
                        $match: {
                            characteristics: {
                                $elemMatch: {
                                    features: {
                                        $all: [
                                            {
                                                $elemMatch: {
                                                    name: 'Материал',
                                                    value: { $elemMatch: { $regex: 'золото', $options: 'i' } },
                                                },
                                            },
                                            {
                                                $elemMatch: {
                                                    name: 'Проба',
                                                    value: { $in: ['585', '750', '999'] },
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                    {
                        $project: { sku: 1, _id: 0 },
                    },
                ])
                    .exec();
                goldProducts.forEach((gp) => {
                    goldProductsMap.set(gp.sku, true);
                });
            }
            catch (error) {
                console.error('Error fetching gold products in batch:', error);
            }
        }
        for (const product of products) {
            try {
                let margin = 0;
                const isAutoGoldDetected = goldProductsMap.get(product.masterProductSku) || false;
                let isGoldConnected = false;
                const manualSetting = manualGoldSettings.get(product._id.toString());
                if (manualSetting !== undefined) {
                    isGoldConnected = manualSetting;
                }
                else {
                    isGoldConnected = isAutoGoldDetected;
                }
                data.push(Object.assign(Object.assign({}, product), { margin,
                    isGoldConnected,
                    isAutoGoldDetected }));
                this.storeCityService.getProductCities(product._id);
            }
            catch (e) {
                console.log('[^]' + ' product.service ' + ' | ' + new Date() + ' | ' + '\n' + e);
            }
        }
        let preOrderCount = 0;
        if (filter === 'preorder') {
            const preOrder = await this.productModel.aggregate([
                {
                    $match: {
                        storeId: new mongoose_1.Types.ObjectId(storeId),
                        isActive: true,
                    },
                },
                {
                    $lookup: {
                        from: 'KaspiProductAvailabilityOnPickupPoint',
                        localField: '_id',
                        foreignField: 'productId',
                        as: 'availability',
                    },
                },
                {
                    $unwind: '$availability',
                },
                {
                    $match: {
                        'availability.preOrder': { $gt: 0 },
                    },
                },
                {
                    $project: {
                        _id: 0,
                        productId: '$_id',
                        storeId: 1,
                        availability: '$availability',
                    },
                },
                {
                    $group: {
                        _id: '$productId',
                        count: { $sum: 1 },
                    },
                },
                {
                    $count: 'total',
                },
            ]);
            if (Array.isArray(preOrder) && preOrder.length > 0) {
                preOrderCount = (_a = preOrder[0]) === null || _a === void 0 ? void 0 : _a.total;
            }
        }
        const count = filter !== 'preorder' ? await this.productModel.countDocuments(q) : preOrderCount;
        const total = await this.productModel.countDocuments({
            storeId,
            isActive: true,
        });
        return {
            data,
            count,
            limit,
            page,
            total,
            filter,
            query,
        };
    }
    getFilterQuery(filter) {
        if (filter === 'first') {
            return {
                place: 1,
                isDemping: true,
                isMinus: false,
            };
        }
        else if (filter === 'changing') {
            return {
                isChanging: true,
                isDemping: true,
                place: {
                    $ne: 1,
                },
                isMinus: false,
            };
        }
        else if (filter === 'minus') {
            return {
                isMinus: true,
                isDemping: true,
            };
        }
        else if (filter === 'min-price-achieved') {
            console.log('min price log');
            return {
                isDemping: true,
                isActive: true,
                $expr: { $eq: ['$availableMinPrice', '$price'] },
            };
        }
        else if (filter === 'off') {
            return {
                isDemping: false,
            };
        }
        else if (filter === 'archive') {
            return {
                isActive: false,
            };
        }
        else if (filter === 'on') {
            return {
                isDemping: true,
            };
        }
        else if (filter === 'no-competitors') {
            return {
                isDemping: true,
                offersCount: 1,
            };
        }
        else if (filter === 'new-products') {
            const last24Hours = new Date(new Date().getTime() - 24 * 60 * 60 * 1000);
            return {
                createdAt: {
                    $gte: last24Hours,
                },
            };
        }
        else if (filter === 'waiting') {
            return {
                isDemping: true,
                isChanging: false,
                place: {
                    $ne: 1,
                },
                isMinus: false,
            };
        }
        else if (filter === 'active-products-no-min-price') {
            return {
                isActive: true,
                availableMinPrice: 0,
            };
        }
        else if (filter === 'archive-products-no-min-price') {
            return {
                isActive: false,
                availableMinPrice: 0,
            };
        }
        else if (filter === 'preorder') {
            return {};
        }
        else if (filter === 'not-set-min-price') {
            return {
                isActive: true,
                isSetMinPrice: false,
            };
        }
        return {};
    }
    async getAllProductsByStoreId(storeId) {
        const products = await this.productModel.find({
            storeId,
            isActive: true,
        });
        return products;
    }
    async getFilerProductsByStoreId(storeId, isActive, isDemping, limit, skip) {
        const query = { storeId };
        if (isActive !== undefined) {
            query.isActive = isActive;
        }
        if (isDemping !== undefined) {
            query.isDemping = isDemping;
        }
        const products = await this.productModel
            .find(query)
            .skip(skip || 0)
            .limit(limit || 0);
        return products;
    }
    async getProductBySku(sku) {
        const product = this.productModel.findOne({ sku });
        return product;
    }
    async getProductStatistics(minusDay = 0) {
        let lteDate = new Date();
        if (minusDay !== 0) {
            lteDate = new Date(new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - minusDay, 23, 59, 59, 999)).getTime() -
                6 * 60 * 60 * 1000);
        }
        const date = new Date(new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - minusDay)).getTime() -
            6 * 60 * 60 * 1000);
        return {
            total: await this.productModel.count({ isActive: true }),
            demping: await this.productModel.count({
                isDemping: true,
                isActive: true,
            }),
            todayLoaded: await this.productModel.count({
                isActive: true,
                createdAt: {
                    $gte: date,
                    $lte: lteDate,
                },
            }),
        };
    }
    async withdrawFromSale(products, storeId) {
        if (products.length === 0) {
            return;
        }
        const store = await this.storeService.getStoreById(storeId);
        const marketplace = await this.marketplaceService.getMarketplace(store.marketplaceId.toString());
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        for (const product of products) {
            const exists = await this.productModel.exists({
                storeId,
                sku: product,
            });
            if (!exists) {
                continue;
            }
            await this.product.updateProduct(exists._id.toString(), {
                isDemping: false,
            });
            if (marketplace.key === 'KASPI') {
                await this.approveOrWithdrawProductQueue.add({
                    type: 'withdraw',
                    data: {
                        storeId,
                        productId: exists._id.toString(),
                        method: 'MANUALLY',
                    },
                }, {
                    removeOnComplete: true,
                    removeOnFail: true,
                });
            }
        }
    }
    async isAvailable(productId) {
        const availabilities = await this.kaspiProductAvailabilityOnPickupPointModel.find({ productId });
        if (!availabilities)
            return false;
        for (const availability of availabilities) {
            const product = await this.productModel.findOne({ _id: productId });
            if (availability.available === true && (availability.amount > 0 || availability.amount === null || product.isPreOrder)) {
                return true;
            }
        }
        return false;
    }
    async approve(storeId, dto) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeService.getStoreById(storeId);
        const marketplace = await this.marketplaceService.getMarketplace(store.marketplaceId.toString());
        const skuOfProductsWithNoPrices = [];
        const skuOfProductsWithNoAvailabilities = [];
        const productToApprove = [];
        for (const sku of dto.products) {
            const foundProduct = await this.productModel.findOne({
                storeId,
                sku,
            });
            if (!foundProduct) {
                throw new common_1.NotFoundException(`${product_constant_1.PRODUCT_NOT_FOUND_ERROR}: ${sku}`);
            }
            if (foundProduct.price === null) {
                skuOfProductsWithNoPrices.push(foundProduct.sku);
            }
            if (!await this.isAvailable(foundProduct._id.toString())) {
                skuOfProductsWithNoAvailabilities.push(foundProduct.sku);
            }
            if (marketplace.key === 'KASPI') {
                productToApprove.push(foundProduct);
            }
        }
        if (skuOfProductsWithNoPrices.length > 0) {
            throw new common_1.BadRequestException(`Нужно указать цену перед выставлением ${skuOfProductsWithNoPrices.length > 1 ? 'товаров' : 'товара'}:\n${skuOfProductsWithNoPrices.map(sku => sku).join(', ')}`);
        }
        else if (skuOfProductsWithNoAvailabilities.length > 0) {
            throw new common_1.BadRequestException(`Нужно указать наличие перед выставлением ${skuOfProductsWithNoAvailabilities.length > 1 ? 'товаров' : 'товара'}:\n${skuOfProductsWithNoAvailabilities.map(sku => sku).join(', ')}`);
        }
        else {
            for (const foundProduct of productToApprove) {
                await this.approveOrWithdrawProductQueue.add({
                    type: 'approve',
                    data: {
                        storeId,
                        productId: foundProduct._id.toString(),
                        method: 'MANUALLY',
                    },
                }, {
                    removeOnComplete: true,
                    removeOnFail: true,
                });
            }
        }
    }
    async getProductByQuery(q, sort = -1) {
        return this.productModel.findOne(q).sort({
            _id: sort,
        });
    }
    async getProductsByQuery(q, sort = -1) {
        return this.productModel.find(q).sort({
            _id: sort,
        });
    }
    async getProductsForMobileApp(userId, storeId) {
        if (!(0, mongoose_1.isValidObjectId)(userId)) {
            throw new common_1.BadRequestException(store_constants_1.USER_NOT_FOUND_ERROR);
        }
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.BadRequestException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        return await this.productModel.find({ storeId });
    }
    async getTopLowMarginProducts(storeId, limit = 10) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            return [];
        }
        return await this.productModel.aggregate([
            {
                $match: {
                    storeId: new mongoose_1.Types.ObjectId(storeId),
                    isActive: true,
                },
            },
            {
                $match: {
                    purchasePrice: { $type: 'number' },
                },
            },
            {
                $project: {
                    price: 1,
                    availableMinPrice: 1,
                    purchasePrice: 1,
                    name: 1,
                    url: 1,
                    sku: 1,
                    _id: 1,
                    profit: {
                        $subtract: ['$price', '$purchasePrice'],
                    },
                    img: 1,
                },
            },
            {
                $sort: {
                    profit: 1,
                },
            },
            {
                $limit: limit,
            },
        ]);
    }
    async getTopMarginProducts(storeId, limit = 10) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            return [];
        }
        return await this.productModel.aggregate([
            {
                $match: {
                    storeId: new mongoose_1.Types.ObjectId(storeId),
                    isActive: true,
                },
            },
            {
                $match: {
                    purchasePrice: { $type: 'number' },
                },
            },
            {
                $project: {
                    price: 1,
                    availableMinPrice: 1,
                    purchasePrice: 1,
                    name: 1,
                    url: 1,
                    sku: 1,
                    _id: 1,
                    img: 1,
                    profit: {
                        $subtract: ['$price', '$purchasePrice'],
                    },
                },
            },
            {
                $sort: {
                    profit: -1,
                },
            },
            {
                $limit: limit,
            },
        ]);
    }
    async getProductChangingStatistics() {
        var _a, _b;
        const averageTime = await this.productChangeModel.aggregate([
            {
                $match: {
                    time: {
                        $ne: 0,
                    },
                    changedDate: {
                        $ne: null,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    averageTime: {
                        $avg: '$time',
                    },
                    minTime: {
                        $min: '$time',
                    },
                    maxTime: {
                        $max: '$time',
                    },
                },
            },
        ]);
        const minProductTime = await this.productChangeModel
            .findOne({
            changedDate: {
                $ne: null,
            },
        })
            .sort({
            time: 1,
        });
        const maxProductTime = await this.productChangeModel
            .findOne({
            changedDate: {
                $ne: null,
            },
        })
            .sort({
            time: -1,
        });
        const maxStore = await this.storeService.getStoreById((_a = maxProductTime === null || maxProductTime === void 0 ? void 0 : maxProductTime.storeId) === null || _a === void 0 ? void 0 : _a.toString());
        const minStore = await this.storeService.getStoreById((_b = minProductTime === null || minProductTime === void 0 ? void 0 : minProductTime.storeId) === null || _b === void 0 ? void 0 : _b.toString());
        const maxProductCount = await this.productModel.count({
            storeId: maxStore === null || maxStore === void 0 ? void 0 : maxStore._id,
        });
        const minProductCount = await this.productModel.count({
            storeId: minStore === null || minStore === void 0 ? void 0 : minStore._id,
        });
        return Object.assign(Object.assign({}, averageTime), { maxStoreInfo: {
                storeName: maxStore === null || maxStore === void 0 ? void 0 : maxStore.name,
                productCount: maxProductCount,
                registrationDate: maxStore === null || maxStore === void 0 ? void 0 : maxStore.createdAt,
            }, minStoreInfo: {
                storeName: minStore === null || minStore === void 0 ? void 0 : minStore.name,
                productCount: minProductCount,
                registrationDate: minStore === null || minStore === void 0 ? void 0 : minStore.createdAt,
            } });
    }
    async massUpdateProducts(userId, storeId, dto) {
        console.log(`massUpdateProducts | ${storeId} | ${new Date()}`);
        const store = await this.storeService.getStoreById(storeId);
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        if (store.userId.toString() !== userId) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        if (dto.isApplyDempingPriceToEverything) {
            const updateFilter = Object.assign({ isActive: true, storeId: store._id.toString() }, this.getFilterQuery(dto.choosedFilter));
            if (dto.isDemping) {
                const products = await this.productModel.find(updateFilter);
                const productIds = products.map((product) => product._id.toString());
                Promise.all(products.map(product => {
                    if (dto.productsId.find(productId => productId === product._id.toString()))
                        this.actualizeProductMerchantsForProductQueue
                            .add({
                            storeId: product.storeId,
                            masterProductSku: product.masterProduct.sku,
                            mainCity: store.mainCity,
                            productUrl: product.url,
                        }, {
                            removeOnComplete: true,
                            removeOnFail: false,
                            priority: 1,
                        })
                            .then(() => {
                            console.log(`ADDED PRODUCT MERCHANT ACTUALIZING IN QUEUE ${product.sku} | ${product.masterProduct.sku} | ${store.name} | ${new Date()}\n`);
                        })
                            .catch((e) => {
                            console.error(`[ ! ] ERROR ADDING PRODUCT MERCHANT ACTUALIZING IN QUEUE ${product.sku} | ${store.name} | ${new Date()}\n${e}`);
                        });
                }));
                await this.checkActiveProductsLimit(store._id, productIds);
            }
            if (dto.isSelectedCityId && store.mainCity.id !== dto.isSelectedCityId) {
                const storeCityId = await this.storeCityService.getStoreCity(storeId, dto.isSelectedCityId);
                await this.ProductCityModel.updateMany(Object.assign({ storeCityId: storeCityId._id.toString() }, updateFilter), dto);
            }
            else {
                const productsBeforeUpdate = await this.productModel.find(updateFilter);
                await this.productModel.updateMany(updateFilter, dto);
                if (this.hasBonusChanges(dto)) {
                    for (const product of productsBeforeUpdate) {
                        try {
                            await this.saveBonusChangeHistory(product._id.toString(), product.storeId.toString(), product.sku, store.name, product.bonus, dto.bonus, product.minBonus, dto.minBonus, product.maxBonus, dto.maxBonus, product.isBonusDemping, dto.isBonusDemping, 'MANUAL', null);
                        }
                        catch (error) {
                            console.error(`[ ! ] ERROR SAVING BONUS CHANGE HISTORY FOR MASS UPDATE | ${product.sku} | ${store.name} | ${new Date()}\n${error}`);
                        }
                    }
                }
            }
            if (dto.preorderDate && dto.preorderDate.length > 0) {
                for (const warehouse of dto.preorderDate) {
                    const pickup = await this.kaspiStorePickupPointModel.findOne({
                        storeId: store._id,
                        displayName: warehouse.displayName,
                    });
                    await Promise.all(dto.productsId.map(async (productId) => {
                        const storePickupPoint = pickup;
                        const product = await this.productModel.findOne({ _id: productId, storeId: store._id });
                        if (!storePickupPoint) {
                            return;
                        }
                        else if (storePickupPoint.storeId.toString() !== product.storeId.toString()) {
                            return;
                        }
                        if (!product)
                            return;
                        const storePickupPointId = storePickupPoint._id;
                        const collectionKey = `kaspiProductAvailabilityOnPickupPoints:${productId}`;
                        const exists = await this.kaspiProductAvailabilityOnPickupPointModel.findOne({
                            storePickupPointId,
                            productId: product._id,
                        });
                        if (exists) {
                            await this.kaspiProductAvailabilityOnPickupPointModel.updateOne({
                                storePickupPointId,
                                productId: product._id,
                            }, {
                                amount: exists.amount,
                                preOrder: warehouse.newPreorderDates,
                                available: exists.available,
                            });
                            const collectionData = await this.kaspiProductAvailabilityOnPickupPointModel.find({
                                productId: product._id,
                            });
                            await this.techRedisClient.del(collectionKey);
                            for (const item of collectionData) {
                                await this.techRedisClient.zAdd(collectionKey, { score: 0, value: JSON.stringify(item) });
                            }
                            await this.techRedisClient.expire(collectionKey, 2 * 60 * 60);
                        }
                        else {
                            await new this.kaspiProductAvailabilityOnPickupPointModel({
                                storePickupPointId,
                                productId: product._id,
                                amount: 0,
                                preOrder: warehouse.newPreorderDates,
                                available: false,
                            }).save();
                            const collectionData = await this.kaspiProductAvailabilityOnPickupPointModel.find({
                                productId: product._id,
                            });
                            await this.techRedisClient.del(collectionKey);
                            for (const item of collectionData) {
                                await this.techRedisClient.zAdd(collectionKey, { score: 0, value: JSON.stringify(item) });
                            }
                            await this.techRedisClient.expire(collectionKey, 2 * 60 * 60);
                        }
                        if (product.isActive && store.expireDate > new Date()) {
                            const foundProduct = await this.productModel.findOne({ _id: product._id });
                            if (!foundProduct) {
                                return;
                            }
                            await this.addJobToQueueForProductChanger(store, foundProduct);
                        }
                    }));
                }
            }
        }
        else {
            if (dto.isDemping) {
                await this.checkActiveProductsLimit(store._id, dto.productsId);
            }
            for (const productId of dto.productsId) {
                if (!(0, mongoose_1.isValidObjectId)(productId)) {
                    throw new common_1.NotFoundException(product_constant_1.PRODUCT_NOT_FOUND_ERROR);
                }
                const product = await this.productModel.findOne({ _id: productId });
                if (dto.isDemping) {
                    this.actualizeProductMerchantsForProductQueue
                        .add({
                        storeId: product.storeId,
                        masterProductSku: product.masterProduct.sku,
                        mainCity: store.mainCity,
                        productUrl: product.url,
                    }, {
                        removeOnComplete: true,
                        removeOnFail: false,
                        priority: 1,
                    })
                        .then(() => {
                        console.log(`ADDED PRODUCT MERCHANT ACTUALIZING IN QUEUE ${product.sku} | ${product.masterProduct.sku} | ${store.name} | ${new Date()}\n`);
                    })
                        .catch((e) => {
                        console.error(`[ ! ] ERROR ADDING PRODUCT MERCHANT ACTUALIZING IN QUEUE ${product.sku} | ${store.name} | ${new Date()}\n${e}`);
                    });
                }
                if (!product || (product === null || product === void 0 ? void 0 : product.storeId.toString()) !== storeId) {
                    throw new common_1.NotFoundException(product_constant_1.PRODUCT_NOT_FOUND_ERROR);
                }
            }
            if (dto.isSelectedCityId && store.mainCity.id !== dto.isSelectedCityId) {
                const storeCityId = await this.storeCityService.getStoreCity(storeId, dto.isSelectedCityId);
                for (const productId of dto.productsId) {
                    await this.ProductCityModel.updateOne({
                        productId,
                        storeCityId: storeCityId._id.toString(),
                    }, dto);
                }
            }
            else {
                for (const productId of dto.productsId) {
                    await this.product.updateProduct(productId.toString(), dto);
                }
            }
            if (dto.preorderDate && dto.preorderDate.length > 0) {
                for (const warehouse of dto.preorderDate) {
                    const pickup = await this.kaspiStorePickupPointModel.findOne({
                        storeId: store._id,
                        displayName: warehouse.displayName,
                    });
                    await Promise.all(dto.productsId.map(async (productId) => {
                        const storePickupPoint = pickup;
                        const product = await this.productModel.findOne({ _id: productId, storeId: store._id });
                        if (!storePickupPoint) {
                            return;
                        }
                        else if (storePickupPoint.storeId.toString() !== product.storeId.toString()) {
                            return;
                        }
                        if (!product)
                            return;
                        const storePickupPointId = storePickupPoint._id;
                        const collectionKey = `kaspiProductAvailabilityOnPickupPoints:${productId}`;
                        const exists = await this.kaspiProductAvailabilityOnPickupPointModel.findOne({
                            storePickupPointId,
                            productId: product._id,
                        });
                        if (exists) {
                            await this.kaspiProductAvailabilityOnPickupPointModel.updateOne({
                                storePickupPointId,
                                productId: product._id,
                            }, {
                                amount: exists.amount,
                                preOrder: warehouse.newPreorderDates,
                                available: exists.available,
                            });
                            const collectionData = await this.kaspiProductAvailabilityOnPickupPointModel.find({
                                productId: product._id,
                            });
                            await this.techRedisClient.del(collectionKey);
                            for (const item of collectionData) {
                                await this.techRedisClient.zAdd(collectionKey, { score: 0, value: JSON.stringify(item) });
                            }
                            await this.techRedisClient.expire(collectionKey, 2 * 60 * 60);
                        }
                        else {
                            await new this.kaspiProductAvailabilityOnPickupPointModel({
                                storePickupPointId,
                                productId: product._id,
                                amount: 0,
                                preOrder: warehouse.newPreorderDates,
                                available: false,
                            }).save();
                            const collectionData = await this.kaspiProductAvailabilityOnPickupPointModel.find({
                                productId: product._id,
                            });
                            await this.techRedisClient.del(collectionKey);
                            for (const item of collectionData) {
                                await this.techRedisClient.zAdd(collectionKey, { score: 0, value: JSON.stringify(item) });
                            }
                            await this.techRedisClient.expire(collectionKey, 2 * 60 * 60);
                        }
                        if (product.isActive && store.expireDate > new Date()) {
                            const foundProduct = await this.productModel.findOne({ _id: product._id });
                            if (!foundProduct) {
                                return;
                            }
                            await this.addJobToQueueForProductChanger(store, foundProduct);
                        }
                    }));
                }
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
        const isPriviligedStore = await this.privilegedStoreService.isPrivileged(storeId.toString());
        if (isPriviligedStore) {
            return;
        }
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
    async getProductImage(masterSku) {
        const product = await this.productModel
            .findOne({ 'masterProduct.sku': masterSku })
            .sort({ updatedAt: -1 })
            .select({ img: 1 })
            .limit(1);
        if (!product) {
            return null;
        }
        return product.img;
    }
    async changeProductDeliveryDuration(storeId, productSku, updatedDeliveryDurations) {
        try {
            const deliveryDurations = await this.productDeliveryDurationModel.findOne({
                storeId: new mongoose_1.Types.ObjectId(storeId),
                sku: productSku,
            });
            if (deliveryDurations) {
                await this.productDeliveryDurationModel.updateOne({ storeId: new mongoose_1.Types.ObjectId(storeId), sku: productSku }, { deliveryDuration: updatedDeliveryDurations });
            }
            else {
                await new this.productDeliveryDurationModel({
                    storeId: new mongoose_1.Types.ObjectId(storeId),
                    sku: productSku,
                    deliveryDuration: updatedDeliveryDurations,
                }).save();
            }
            const product = await this.productModel.findOne({ storeId: new mongoose_1.Types.ObjectId(storeId), sku: productSku });
            await this.productMerchantModel.updateMany({
                masterProductSku: product.masterProduct.sku,
                productUrl: {
                    $regex: /kaspi/i,
                },
            }, { isFullOffersParse: true });
            return { success: true, message: `Operation completed successfully. isFullOffersParse was set to true` };
        }
        catch (error) {
            console.log('[^]' + ' product.service ' + ' | ' + new Date() + ' | ' + 'An error occurred' + ' | ' + '\n' + error);
            return { success: false, error: error.message };
        }
    }
    async getProductDeliveryDuration(storeId, productSku) {
        const deliveryDurations = await this.productDeliveryDurationModel.findOne({ storeId: new mongoose_1.Types.ObjectId(storeId), sku: productSku });
        if (!deliveryDurations) {
            return 'all';
        }
        return deliveryDurations;
    }
    async getProductsRequests(storeId) {
        const productsRequests = await this.changePriceRequestResultModel.aggregate([
            {
                $match: {
                    'storeId': new mongoose_1.Types.ObjectId(storeId),
                    'data.status': 200,
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $limit: 250,
            },
            {
                $project: {
                    productId: 1,
                    createdAt: 1,
                    type: 'request',
                },
            },
        ]);
        const approveProductsRequests = await this.approveProductForSaleHistoryModel
            .find({
            storeId: new mongoose_1.Types.ObjectId(storeId),
            createdAt: { $gt: new Date(new Date().getTime() - 60 * 60 * 1000) },
            status: 200,
        }, {
            productId: 1,
            createdAt: 1,
            type: 'approve',
        })
            .limit(250);
        const allRequests = [...productsRequests, ...approveProductsRequests]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 250);
        const productsInfo = await this.productModel.aggregate([
            {
                $match: {
                    storeId: new mongoose_1.Types.ObjectId(storeId),
                    _id: {
                        $in: allRequests.map((product) => product.productId),
                    },
                },
            },
            {
                $project: {
                    name: 1,
                    url: 1,
                    sku: 1,
                    img: 1,
                },
            },
        ]);
        const productsRequestsWithInfo = allRequests.map((productRequest) => {
            const productInfo = productsInfo.find((product) => product._id.toString() === productRequest.productId.toString());
            return {
                createdAt: productRequest.createdAt.toISOString(),
                type: productRequest.type,
                name: productInfo.name,
                url: productInfo.url,
                sku: productInfo.sku,
                img: productInfo.img,
            };
        });
        return {
            products: productsRequestsWithInfo,
        };
    }
    async deleteProductDeliveryDuration(storeId, productSku) {
        try {
            await this.productDeliveryDurationModel.deleteOne({ storeId: new mongoose_1.Types.ObjectId(storeId), sku: productSku });
            const product = await this.productModel.findOne({ storeId: new mongoose_1.Types.ObjectId(storeId), sku: productSku });
            const aggregateQuery = [
                {
                    $match: { 'masterProduct.sku': product.masterProduct.sku },
                },
                {
                    $lookup: {
                        from: 'productDeliveryDurationModel',
                        localField: 'sku',
                        foreignField: 'sku',
                        as: 'deliveryDuration',
                    },
                },
                {
                    $addFields: {
                        hasDeliveryDuration: { $gt: [{ $size: '$deliveryDuration' }, 0] },
                    },
                },
            ];
            const result = await this.productModel.aggregate(aggregateQuery);
            let isFullOffersParse = result.some((product) => product.hasDeliveryDuration);
            await this.productMerchantModel.updateMany({
                masterProductSku: product.masterProduct.sku,
                productUrl: {
                    $regex: /kaspi/i,
                },
            }, { isFullOffersParse });
            return { success: true, message: isFullOffersParse };
        }
        catch (error) {
            console.log('[^]' + ' product.service ' + ' | ' + new Date() + ' | ' + 'An error occurred' + ' | ' + '\n' + error);
            return { success: false, error: error.message };
        }
    }
    async changeManyProductDeliveryDuration(storeId, productSku, updatedDeliveryDurations) {
        for (const sku of productSku) {
            let response;
            if (updatedDeliveryDurations[0] == product_delivery_duration_model_1.ProductDeliveryDurationEnum.ALL) {
                response = await this.deleteProductDeliveryDuration(storeId, sku);
            }
            else {
                response = await this.changeProductDeliveryDuration(storeId, sku, updatedDeliveryDurations);
            }
            if (!response.success) {
                return { success: false, error: 'Произошла ошибка во время массового обновления доставок!' };
            }
        }
        return { success: true, message: 'Доставки успешно обновлены!' };
    }
    hasBonusChanges(dto) {
        return dto.bonus !== undefined ||
            dto.minBonus !== undefined ||
            dto.maxBonus !== undefined ||
            dto.isBonusDemping !== undefined;
    }
    async saveBonusChangeHistory(productId, storeId, sku, storeName, oldBonus, newBonus, oldMinBonus, newMinBonus, oldMaxBonus, newMaxBonus, oldIsBonusDemping, newIsBonusDemping, changeMethod = 'MANUAL', changedBy) {
        const changes = [];
        if (typeof oldBonus === 'number' && typeof newBonus === 'number' && oldBonus !== newBonus) {
            changes.push({
                sku,
                productId: new mongoose_1.Types.ObjectId(productId),
                storeId: new mongoose_1.Types.ObjectId(storeId),
                storeName,
                changeType: 'bonus',
                oldBonusValue: oldBonus,
                newBonusValue: newBonus,
                oldBooleanValue: null,
                newBooleanValue: null,
                changeDate: new Date(),
                changeMethod,
                changedBy
            });
        }
        if (typeof oldMinBonus === 'number' && typeof newMinBonus === 'number' && oldMinBonus !== newMinBonus) {
            changes.push({
                sku,
                productId: new mongoose_1.Types.ObjectId(productId),
                storeId: new mongoose_1.Types.ObjectId(storeId),
                storeName,
                changeType: 'minBonus',
                oldBonusValue: oldMinBonus,
                newBonusValue: newMinBonus,
                oldBooleanValue: null,
                newBooleanValue: null,
                changeDate: new Date(),
                changeMethod,
                changedBy
            });
        }
        if (typeof oldMaxBonus === 'number' && typeof newMaxBonus === 'number' && oldMaxBonus !== newMaxBonus) {
            changes.push({
                sku,
                productId: new mongoose_1.Types.ObjectId(productId),
                storeId: new mongoose_1.Types.ObjectId(storeId),
                storeName,
                changeType: 'maxBonus',
                oldBonusValue: oldMaxBonus,
                newBonusValue: newMaxBonus,
                oldBooleanValue: null,
                newBooleanValue: null,
                changeDate: new Date(),
                changeMethod,
                changedBy
            });
        }
        if (typeof oldIsBonusDemping === 'boolean' && typeof newIsBonusDemping === 'boolean' && oldIsBonusDemping !== newIsBonusDemping) {
            changes.push({
                sku,
                productId: new mongoose_1.Types.ObjectId(productId),
                storeId: new mongoose_1.Types.ObjectId(storeId),
                storeName,
                changeType: 'isBonusDemping',
                oldBonusValue: null,
                newBonusValue: null,
                oldBooleanValue: oldIsBonusDemping,
                newBooleanValue: newIsBonusDemping,
                changeDate: new Date(),
                changeMethod,
                changedBy
            });
        }
        if (changes.length > 0) {
            try {
                await this.bonusChangeModel.insertMany(changes);
                console.log(`[ > ] BONUS CHANGES SAVED | ${sku} | ${storeName} | ${changes.length} changes | ${new Date()}`);
            }
            catch (error) {
                console.error(`[ ! ] ERROR SAVING BONUS CHANGES | ${sku} | ${storeName} | ${new Date()}\n${error}`);
            }
        }
    }
    async getBonusChangeHistory(productId, limit = 50, page = 1) {
        if (!(0, mongoose_1.isValidObjectId)(productId)) {
            throw new common_1.NotFoundException(product_constant_1.PRODUCT_NOT_FOUND_ERROR);
        }
        const skip = (page - 1) * limit;
        const changes = await this.bonusChangeModel
            .find({ productId: new mongoose_1.Types.ObjectId(productId) })
            .sort({ changeDate: -1 })
            .skip(skip)
            .limit(limit);
        const total = await this.bonusChangeModel.countDocuments({ productId: new mongoose_1.Types.ObjectId(productId) });
        return {
            data: changes,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    }
    async updateGoldLinkStatus(storeId, productId, isLinked) {
        if (!(0, mongoose_1.isValidObjectId)(storeId) || !(0, mongoose_1.isValidObjectId)(productId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const result = await this.goldLinkedProductModel.findOneAndUpdate({ storeId: new mongoose_1.Types.ObjectId(storeId), productId: new mongoose_1.Types.ObjectId(productId) }, { isLinked, updatedAt: new Date() }, { upsert: true, new: true });
        console.log(`[ > ] GOLD LINK STATUS UPDATED | Store: ${storeId} | Product: ${productId} | isLinked: ${isLinked} | ${new Date()}`);
        return result;
    }
    async deleteGoldLinkStatus(storeId, productId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId) || !(0, mongoose_1.isValidObjectId)(productId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const result = await this.goldLinkedProductModel.findOneAndDelete({
            storeId: new mongoose_1.Types.ObjectId(storeId),
            productId: new mongoose_1.Types.ObjectId(productId),
        });
        console.log(`[ > ] GOLD LINK STATUS DELETED (BACK TO AUTO) | Store: ${storeId} | Product: ${productId} | ${new Date()}`);
        return result;
    }
    async getGoldLinkedProductsMap(storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            return new Map();
        }
        const products = await this.goldLinkedProductModel
            .find({ storeId: new mongoose_1.Types.ObjectId(storeId) })
            .lean()
            .exec();
        const map = new Map();
        products.forEach((p) => {
            map.set(p.productId.toString(), p.isLinked);
        });
        return map;
    }
};
ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_typegoose_1.InjectModel)(product_model_1.ProductModel)),
    __param(1, (0, nestjs_typegoose_1.InjectModel)(product_city_model_1.ProductCityModel)),
    __param(2, (0, nestjs_typegoose_1.InjectModel)(kaspi_product_availability_on_pickup_point_model_1.KaspiProductAvailabilityOnPickupPointModel)),
    __param(3, (0, nestjs_typegoose_1.InjectModel)(kaspi_store_pickup_point_model_1.KaspiStorePickupPointModel)),
    __param(4, (0, nestjs_typegoose_1.InjectModel)(product_change_model_1.ProductChangeModel)),
    __param(5, (0, nestjs_typegoose_1.InjectModel)(analytics_product_model_1.AnalyticsProductModel)),
    __param(6, (0, nestjs_typegoose_1.InjectModel)(bonus_change_model_1.BonusChangeModel)),
    __param(7, (0, nestjs_typegoose_1.InjectModel)(product_delivery_duration_model_1.ProductDeliveryDurationModel)),
    __param(8, (0, nestjs_typegoose_1.InjectModel)(product_merchant_model_1.ProductMerchantModel)),
    __param(9, (0, nestjs_typegoose_1.InjectModel)(change_price_request_result_model_1.ChangePriceRequestResultModel)),
    __param(10, (0, nestjs_typegoose_1.InjectModel)(approve_product_for_sale_history_model_1.ApproveProductForSaleHistoryModel)),
    __param(11, (0, nestjs_typegoose_1.InjectModel)(gold_linked_product_model_1.GoldLinkedProductModel)),
    __param(13, (0, common_1.Inject)((0, common_1.forwardRef)(() => store_service_1.StoreService))),
    __param(15, (0, common_1.Inject)((0, common_1.forwardRef)(() => store_city_service_1.StoreCityService))),
    __param(22, (0, bull_1.InjectQueue)('actualize-product-merchants-for-product-queue')),
    __param(23, (0, bull_1.InjectQueue)('approve-or-withdraw-product-queue')),
    __param(24, (0, bull_1.InjectQueue)('demping-tasks-for-product-changer-manager-queue')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, proxy_service_1.ProxyService,
        store_service_1.StoreService,
        marketplace_service_1.MarketplaceService,
        store_city_service_1.StoreCityService,
        kaspi_service_1.KaspiService,
        product_1.Product,
        kaspi_category_comission_service_1.KaspiCategoryComissionService,
        kaspi_promotion_service_1.KaspiPromotionService,
        analytics_service_1.AnalyticsService,
        privileged_store_service_1.PrivilegedStoreService, Object, Object, Object])
], ProductService);
exports.ProductService = ProductService;
//# sourceMappingURL=product.service.js.map