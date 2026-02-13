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
exports.StoreService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const marketplace_service_1 = require("../marketplace/marketplace.service");
const user_service_1 = require("../user/user.service");
const store_constants_1 = require("./store.constants");
const store_model_1 = require("./store.model");
const store_wa_model_1 = require("../store-wa/store-wa.model");
const store_state_history_model_1 = require("./store-state-history.model");
const mongoose_1 = require("mongoose");
const store_city_service_1 = require("../store-city/store-city.service");
const kaspi_service_1 = require("./kaspi.service");
const order_service_1 = require("../order/order.service");
const product_service_1 = require("../product/product.service");
const price_history_service_1 = require("../price-history/price-history.service");
const store_statistics_model_1 = require("./store-statistics.model");
const store_finish_model_1 = require("./store-finish.model");
const marketplace_constants_1 = require("../marketplace/marketplace.constants");
const product_load_queue_model_1 = require("./product-load-queue.model");
const product_load_queue_message_model_1 = require("./product-load-queue-message.model");
const product_load_queue_sum_model_1 = require("./product-load-queue-sum.model");
const store_wa_service_1 = require("../store-wa/store-wa.service");
const did_not_renew_the_subscription_model_1 = require("./did-not-renew-the-subscription.model");
const bull_1 = require("@nestjs/bull");
const cron_1 = require("cron");
const city_service_1 = require("../city/city.service");
const kaspi_store_pickup_point_model_1 = require("./kaspi-store-pickup-point.model");
const store_position_metrics_model_1 = require("./store-position-metrics.model");
const metrics_1 = require("../metrics");
const fs_extra_1 = require("fs-extra");
const node_xlsx_1 = require("node-xlsx");
const path = require("path");
const redis_1 = require("redis");
const marketplace_city_model_1 = require("../city/marketplace-city.model");
const store_upload_limit_model_1 = require("./store-upload-limit.model");
const xml_upload_history_model_1 = require("./xml-upload-history.model");
const payment_model_1 = require("../payment/payment.model");
const order_load_queue_message_model_1 = require("./order-load-queue-message.model");
const order_load_queue_sum_model_1 = require("./order-load-queue-sum.model");
const order_load_queue_model_1 = require("./order-load-queue.model");
const kaspi_tmp_util_1 = require("./kaspi-tmp.util");
const analytics_service_1 = require("../analytics/analytics.service");
const integration_model_1 = require("./integration.model");
let StoreService = class StoreService {
    constructor(orderLoadQueue, orderLoadQueueMessage, orderLoadQueueSum, storeModel, storeStatisticsModel, productLoadQueue, productLoadQueueMessage, productLoadQueueSum, storeFinishModel, paymentModel, marketplaceCityModel, storePositionMetricsModel, xmlUploadHistoryModel, userService, marketplaceService, storeCityService, kaspiService, orderService, productService, priceHistoryService, kaspiStorePickupPointModel, storeWaService, kaspiStoreUploadLimitModel, actualizeProductMerchantsForProductQueue, loadProductsQueue, getKaspiStoreApiTokenQueue, actualizeKaspiStorePickupPointsQueue, loadKaspiActiveProductsClientQueue, loadKaspiActiveProductsByXmlQueue, loadKaspiArchiveProductsByXmlQueue, loadProductsFromXmlQueue, loadKaspiArchiveProductsQueue, actualizeProductMerchantsQueue, actualizeKaspiStoreCitiesQueue, clearXmlHashAndXmlHаshSumForStoreQueue, actualizeStoreActiveProdutsHashQueue, loadKaspiOrdersQueue, analyticsService, cityService, storeWaModel, storeStateHistoryModel, integrationModel) {
        this.orderLoadQueue = orderLoadQueue;
        this.orderLoadQueueMessage = orderLoadQueueMessage;
        this.orderLoadQueueSum = orderLoadQueueSum;
        this.storeModel = storeModel;
        this.storeStatisticsModel = storeStatisticsModel;
        this.productLoadQueue = productLoadQueue;
        this.productLoadQueueMessage = productLoadQueueMessage;
        this.productLoadQueueSum = productLoadQueueSum;
        this.storeFinishModel = storeFinishModel;
        this.paymentModel = paymentModel;
        this.marketplaceCityModel = marketplaceCityModel;
        this.storePositionMetricsModel = storePositionMetricsModel;
        this.xmlUploadHistoryModel = xmlUploadHistoryModel;
        this.userService = userService;
        this.marketplaceService = marketplaceService;
        this.storeCityService = storeCityService;
        this.kaspiService = kaspiService;
        this.orderService = orderService;
        this.productService = productService;
        this.priceHistoryService = priceHistoryService;
        this.kaspiStorePickupPointModel = kaspiStorePickupPointModel;
        this.storeWaService = storeWaService;
        this.kaspiStoreUploadLimitModel = kaspiStoreUploadLimitModel;
        this.actualizeProductMerchantsForProductQueue = actualizeProductMerchantsForProductQueue;
        this.loadProductsQueue = loadProductsQueue;
        this.getKaspiStoreApiTokenQueue = getKaspiStoreApiTokenQueue;
        this.actualizeKaspiStorePickupPointsQueue = actualizeKaspiStorePickupPointsQueue;
        this.loadKaspiActiveProductsClientQueue = loadKaspiActiveProductsClientQueue;
        this.loadKaspiActiveProductsByXmlQueue = loadKaspiActiveProductsByXmlQueue;
        this.loadKaspiArchiveProductsByXmlQueue = loadKaspiArchiveProductsByXmlQueue;
        this.loadProductsFromXmlQueue = loadProductsFromXmlQueue;
        this.loadKaspiArchiveProductsQueue = loadKaspiArchiveProductsQueue;
        this.actualizeProductMerchantsQueue = actualizeProductMerchantsQueue;
        this.actualizeKaspiStoreCitiesQueue = actualizeKaspiStoreCitiesQueue;
        this.clearXmlHashAndXmlHаshSumForStoreQueue = clearXmlHashAndXmlHаshSumForStoreQueue;
        this.actualizeStoreActiveProdutsHashQueue = actualizeStoreActiveProdutsHashQueue;
        this.loadKaspiOrdersQueue = loadKaspiOrdersQueue;
        this.analyticsService = analyticsService;
        this.cityService = cityService;
        this.storeWaModel = storeWaModel;
        this.storeStateHistoryModel = storeStateHistoryModel;
        this.integrationModel = integrationModel;
        this.redisClient = (0, redis_1.createClient)({
            url: process.env.REDIS_URL || '',
        });
        this.techRedisClient = (0, redis_1.createClient)({
            url: process.env.TECH_REDIS_URL || '',
        });
        if (process.env.ENVIRONMENT === 'prod') {
            this.launchCrons();
        }
        this.test();
        this.redisClient.connect().then(() => {
            console.log(`REDIS IN STORE CONNECTED`);
        });
        this.techRedisClient.connect().then(() => {
            console.log(`TECH REDIS IN STORE CONNECTED`);
        });
    }
    async test() {
    }
    async getStorePickupPoint(storeId, displayName) {
        return this.kaspiStorePickupPointModel.findOne({ storeId, displayName });
    }
    async getStorePositionMetrics(startDate, endDate) {
        const maxTimeInterval = 24 * 60 * 60 * 1000;
        const currentDate = new Date();
        if (currentDate < endDate) {
            endDate = currentDate;
        }
        if (endDate.getTime() - startDate.getTime() > maxTimeInterval) {
            startDate = new Date(endDate.getTime() - maxTimeInterval);
        }
        const metrics = await this.storePositionMetricsModel.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },
            {
                $addFields: {
                    createdAtTimestamp: { $toLong: { $divide: [{ $toLong: '$createdAt' }, 1000] } },
                },
            },
            {
                $addFields: {
                    roundedTime: { $subtract: ['$createdAtTimestamp', { $mod: ['$createdAtTimestamp', 60 * 10] }] },
                },
            },
            {
                $group: {
                    _id: {
                        roundedTime: '$roundedTime',
                    },
                    saleScoutClientFirstPlacePresenceRate: { $avg: '$saleScoutClientFirstPlacePresenceRate' },
                },
            },
            {
                $project: {
                    averagePercentage: '$saleScoutClientFirstPlacePresenceRate',
                    _id: 0,
                    time: '$_id.roundedTime',
                },
            },
            {
                $sort: {
                    time: 1,
                },
            },
        ]);
        return metrics;
    }
    async updateStoresData() {
        const stores = await this.storeModel
            .find({
            storeId: '',
            expireDate: { $gte: new Date() },
            marketplaceId: '627dfe7069143a7ce045a42f',
            _id: '63a94761fcd87055faa266c4',
        })
            .select({
            login: 1,
            password: 1,
            storeId: 1,
            cookie: 1,
            userAgent: 1,
        });
        for (let store of stores) {
            try {
                const kaspiSettings = await this.kaspiService.getSettings(store.login, store.password, store.storeId);
                if (kaspiSettings.isAuthorized) {
                    console.log(kaspiSettings);
                    await this.storeModel.updateOne({
                        _id: store._id,
                    }, {
                        cookie: kaspiSettings.cookie,
                        name: kaspiSettings.name,
                        storeId: kaspiSettings.storeId,
                        url: kaspiSettings.url,
                        logo: kaspiSettings.logo,
                        isBadCredentials: false,
                        unauthDate: null,
                    });
                }
            }
            catch (e) {
                console.log('[^]' + ' store.sarvice updateStoresData' + ' | ' + new Date() + ' | ' + '\n' + e);
            }
        }
    }
    async getRandomStore() {
        const stores = await this.storeModel.find({
            cookie: { $ne: '' },
            expireDate: { $gte: new Date() },
        });
        if (stores.length <= 0) {
            return null;
        }
        return stores[parseInt(Math.random() * stores.length + '')];
    }
    async getAllStores() {
        return this.storeModel.find({});
    }
    async getMainCity(storeId) {
        return this.storeModel.findOne({ _id: storeId }).select({ mainCity: 1 });
    }
    async getActiveStores() {
        return this.storeModel.find({
            expireDate: {
                $gte: new Date(),
            },
        });
    }
    async updateStoreTaxRegime(storeId, taxRegime) {
        const store = await this.storeModel.findByIdAndUpdate(storeId, { $set: { taxRegime: taxRegime } }, { new: true });
        if (!store) {
            throw new common_1.NotFoundException('Store not found');
        }
        return store;
    }
    async getActiveStoresPaymentData() {
        let sumNotOverdue = 0;
        const stores = await this.storeModel.aggregate([
            {
                $match: {
                    isTest: false,
                    expireDate: {
                        $gte: new Date(),
                    },
                },
            },
            {
                $lookup: {
                    from: 'Payment',
                    localField: '_id',
                    foreignField: 'storeId',
                    as: 'result',
                    pipeline: [
                        {
                            $match: {
                                newExpireDate: {
                                    $gte: new Date(),
                                },
                            },
                        },
                    ],
                },
            },
        ]);
        let amountNotOverdue = stores.length;
        for (const store of stores) {
            for (const payment of store.result) {
                if (!payment.numberOfMonth || payment.number === 0) {
                    sumNotOverdue += payment.price;
                    continue;
                }
                sumNotOverdue += payment.price / Math.ceil(payment.numberOfMonth);
            }
        }
        return {
            sumNotOverdue: Math.ceil(sumNotOverdue),
            notOverdue: amountNotOverdue,
        };
    }
    async launchCrons() {
        try {
            new cron_1.CronJob('0 0 * * *', async () => {
                await this.storeFinishModel.deleteMany({});
            }).start();
        }
        catch (e) {
            console.log('[^]' + ' store.sarvice  launchCrons' + ' | ' + new Date() + ' | ' + '\n' + e);
        }
    }
    async getStoresByUserIdForClient(userId) {
        if (!(0, mongoose_1.isValidObjectId)(userId)) {
            return [];
        }
        const WHATSAPP_FEATURE_ID = new mongoose_1.Types.ObjectId('66a9d64d68beee720bc1f3d0');
        const stores = await this.storeModel.aggregate([
            {
                $match: {
                    userId: new mongoose_1.Types.ObjectId(userId),
                },
            },
            {
                $unset: ['cookie', 'userAgent', 'createdAt', '__v', 'updatedAt', 'password', 'isUpdatedLeadTest', 'isTest', 'isProcessing'],
            },
            ...this.getPrivilegedStoreQuery(),
            {
                $lookup: {
                    from: 'Marketplace',
                    localField: 'marketplaceId',
                    foreignField: '_id',
                    as: 'marketplaces',
                    pipeline: [
                        {
                            $project: {
                                key: 1,
                                color: 1,
                                name: 1,
                                logo: 1,
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: 'StoreFeatureLink',
                    let: { storeId: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$storeId', '$$storeId'] },
                                        { $eq: ['$featureId', WHATSAPP_FEATURE_ID] },
                                        { $eq: ['$status', 'ACTIVE'] },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                _id: 0,
                                featureExpiryDate: 1,
                            },
                        },
                    ],
                    as: 'whatsappFeature',
                },
            },
            {
                $project: {
                    marketplace: {
                        $cond: [
                            {
                                $eq: ['$marketplaces', null],
                            },
                            null,
                            { $arrayElemAt: ['$marketplaces', 0] },
                        ],
                    },
                    name: 1,
                    expireDate: 1,
                    login: 1,
                    privilege: 1,
                    isStarted: 1,
                    whatsappExpireDate: {
                        $cond: [
                            { $gt: [{ $size: '$whatsappFeature' }, 0] },
                            { $arrayElemAt: ['$whatsappFeature.featureExpiryDate', 0] },
                            null,
                        ],
                    },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ]);
        return stores;
    }
    async getStoresByUserId(userId) {
        const result = [];
        await this.storeModel.deleteOne({
            userId,
            name: '',
        });
        const stores = await this.storeModel.find({ userId }).select({
            cityLimit: 1,
            dempingPrice: 1,
            expireDate: 1,
            isTest: 1,
            login: 1,
            mainCity: 1,
            marketplaceId: 1,
            name: 1,
            updatedAt: 1,
            userId: 1,
            url: 1,
            apiToken: 1,
            isBadCredentials: 1,
            cookie: 1,
            password: 1,
            storeId: 1,
            maxDempingProducts: 1,
        });
        for (const store of stores) {
            result.push({
                store,
                marketplace: await this.marketplaceService.getMarketplace(store.marketplaceId.toString()),
            });
        }
        return result;
    }
    async getStoreByUserId(userId, storeId) {
        const store = await this.storeModel.findOne({ userId, _id: storeId }).select({
            cityLimit: 1,
            dempingPrice: 1,
            expireDate: 1,
            isTest: 1,
            login: 1,
            mainCity: 1,
            marketplaceId: 1,
            isBadCredentials: 1,
            name: 1,
            updatedAt: 1,
            userId: 1,
            url: 1,
            apiToken: 1,
            password: 1,
        });
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const marketplace = await this.marketplaceService.getMarketplace(store.marketplaceId.toString());
        return {
            store,
            marketplace,
            cities: await this.marketplaceCityModel.find().select({ id: 1, name: 1 }),
            storeCities: await this.storeCityService.getStoreCities(store._id.toString()),
        };
    }
    async getByMerchantId(merchantId) {
        return this.storeModel.findOne({
            storeId: merchantId,
        });
    }
    async getStoreByIdForClient(id) {
        let _id;
        try {
            _id = new mongoose_1.Types.ObjectId(id);
        }
        catch (e) {
            console.log('[^]' + ' store.sarvice getStoreByIdForClient' + ' | ' + new Date() + ' | ' + '\n' + e);
        }
        if (!_id) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeModel.aggregate([
            {
                $match: {
                    _id,
                },
            },
            {
                $lookup: {
                    from: 'StoreFeatureLink',
                    as: 'storeFeatureLink',
                    localField: '_id',
                    foreignField: 'storeId',
                    pipeline: [
                        {
                            $match: {
                                featureId: new mongoose_1.Types.ObjectId('66a9d64d68beee720bc1f3d0'),
                            },
                        },
                        {
                            $project: {
                                featureExpiryDate: 1,
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: 'Marketplace',
                    as: 'marketplace',
                    localField: 'marketplaceId',
                    foreignField: '_id',
                    pipeline: [
                        {
                            $project: {
                                color: 1,
                                key: 1,
                                logo: 1,
                                name: 1,
                                _id: 1,
                            },
                        },
                    ],
                },
            },
            {
                $set: {
                    marketplace: {
                        $arrayElemAt: ['$marketplace', 0],
                    },
                    sendReviewsExpireDate: {
                        $ifNull: [{ $arrayElemAt: ['$storeFeatureLink.featureExpiryDate', 0] }, null],
                    },
                },
            },
            {
                $unset: [
                    'userAgent',
                    'createdAt',
                    '__v',
                    'updatedAt',
                    'password',
                    'isUpdatedLeadTest',
                    'storeFeatureLink',
                    'isProcessing',
                    'changePriceMethod',
                    'isAutoUploadXml',
                    'requestType',
                    'privilege',
                    'techData',
                ],
            },
            ...this.getPrivilegedStoreQuery(),
        ]);
        if (store.length === 0) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        return store[0];
    }
    getPrivilegedStoreQuery() {
        return [
            {
                $lookup: {
                    from: 'PrivilegedStore',
                    as: 'privileges',
                    localField: '_id',
                    foreignField: 'storeId',
                    pipeline: [
                        {
                            $match: {
                                isActive: true,
                                isBlocked: false,
                            },
                        },
                        {
                            $project: {
                                activatedDate: 1,
                                isActive: 1,
                            },
                        },
                    ],
                },
            },
            {
                $set: {
                    privilege: {
                        $cond: [
                            {
                                $eq: ['$privileges', []],
                            },
                            false,
                            true,
                        ],
                    },
                },
            },
            {
                $unset: ['privileges'],
            },
        ];
    }
    async getStoreById(id) {
        let _id;
        try {
            _id = new mongoose_1.Types.ObjectId(id);
        }
        catch (e) {
            console.log('[^]' + ' store.sarvice getStoreById' + ' | ' + new Date() + ' | ' + '\n' + e);
        }
        if (!_id) {
            return null;
        }
        return await this.storeModel.findOne({ _id }).select({
            cityLimit: 1,
            dempingPrice: 1,
            expireDate: 1,
            isTest: 1,
            login: 1,
            mainCity: 1,
            marketplaceId: 1,
            name: 1,
            updatedAt: 1,
            userId: 1,
            url: 1,
            apiToken: 1,
            isBadCredentials: 1,
            cookie: 1,
            isAutoRaise: 1,
            password: 1,
            createdAt: 1,
            maxDempingProducts: 1,
            userAgent: 1,
            storeId: 1,
            maxNotCompeteStoreCount: 1,
            isStarted: 1,
            requestType: 1,
            orderStatusExpireDate: 1,
            merchantOrderAccess: 1,
            changePriceMethod: 1,
            taxRegime: 1,
        });
    }
    async createStore(dto, userId) {
        const user = await this.userService.findUserById(userId);
        const countStores = await this.storeModel.count({ userId });
        if (!user) {
            throw new common_1.UnauthorizedException('Пользователь не найден');
        }
        const marketplace = await this.marketplaceService.getMarketplace(dto.marketplaceId);
        if (!marketplace) {
            throw new common_1.NotFoundException(marketplace_constants_1.MARKETPLACE_NOT_FOUND_ERROR);
        }
        let foundStore = await this.storeModel.findOne({
            login: dto.login,
            marketplaceId: dto.marketplaceId,
        });
        let foundUser = null;
        if (foundStore) {
            foundUser = await this.userService.findUserById(foundStore.userId.toString());
            throw new common_1.BadRequestException({
                login: foundStore.login,
                phone: foundUser.email,
                message: store_constants_1.STORE_ALREADY_EXISTS_ERROR,
            });
        }
        if (countStores >= user.storeLimit) {
            console.log(countStores, user.storeLimit);
            throw new common_1.BadRequestException(store_constants_1.MAX_STORE_ERROR);
        }
        let kaspiSettings;
        kaspiSettings = await this.kaspiService.checkKaspiCredentials(dto.login, dto.password);
        if (!kaspiSettings.isAuthorized) {
            throw new common_1.BadRequestException(store_constants_1.KASPI_BAD_CREDENTIALS_ERROR);
        }
        let newStore;
        try {
            const storeData = {
                userId: user._id,
                login: dto.login,
                password: dto.password,
                marketplaceId: marketplace._id,
                maxDempingProducts: 99999,
                requestType: 'NEW',
                isTest: countStores === 0,
            };
            if (countStores === 0) {
                storeData.expireDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3);
            }
            else {
                storeData.expireDate = new Date();
            }
            newStore = await new this.storeModel(storeData).save();
            await this.userService.updateIsRef(user._id.toString(), false);
            if (kaspiSettings.isAuthorized) {
                foundStore = await this.storeModel.findOne({
                    url: kaspiSettings.url,
                });
                if (foundStore) {
                    foundUser = await this.userService.findUserById(foundStore.userId.toString());
                    kaspiSettings.isAuthorized = false;
                    throw new common_1.BadRequestException({
                        login: foundStore.login,
                        phone: foundUser.email,
                        message: store_constants_1.STORE_ALREADY_EXISTS_ERROR,
                    });
                }
                await this.storeModel.updateOne({
                    _id: newStore._id,
                }, {
                    login: dto.login,
                    password: dto.password,
                    name: kaspiSettings.name,
                    url: kaspiSettings.url,
                    logo: kaspiSettings.logo,
                    cookie: kaspiSettings.cookie,
                    storeId: kaspiSettings.storeId,
                });
                await this.userService.testUsed(userId);
                const store = await this.storeModel.findOne({ _id: newStore._id });
                let isLeadUpdated = false;
                this.kaspiService.checkApiToken(kaspiSettings.cookie, newStore._id.toString());
                new this.productLoadQueue({
                    storeId: store._id,
                }).save();
                const jobOptions = {
                    removeOnComplete: true,
                    removeOnFail: true,
                    priority: 1,
                };
                this.getKaspiStoreApiTokenQueue
                    .add({
                    storeId: store._id.toString(),
                }, jobOptions)
                    .catch((err) => {
                    console.log('[^]' + ' store.sarvice getKaspiStoreApiTokenQueue' + ' | ' + new Date() + ' | ' + '\n' + err);
                });
                this.actualizeKaspiStoreCitiesQueue
                    .add({
                    storeId: store._id.toString(),
                }, jobOptions)
                    .catch((e) => {
                    console.log('[^]' + ' store.sarvice actualizeKaspiStoreCitiesQueue' + ' | ' + new Date() + ' | ' + '\n' + e);
                });
                jobOptions.jobId = store._id.toString();
                this.actualizeKaspiStorePickupPointsQueue
                    .add({
                    storeId: store._id.toString(),
                }, jobOptions)
                    .catch((err) => {
                    console.log('[^]' + ' store.sarvice actualizeKaspiStorePickupPointsQueue' + ' | ' + new Date() + ' | ' + '\n' + err);
                });
                return store;
            }
            else {
                if (newStore === null || newStore === void 0 ? void 0 : newStore._id) {
                    await this.storeModel.deleteOne({ _id: newStore._id });
                }
                throw new common_1.BadRequestException(store_constants_1.KASPI_BAD_CREDENTIALS_ERROR);
            }
        }
        catch (e) {
            await this.storeModel.deleteOne({ _id: newStore._id });
            console.log('[^]' + ' store.sarvice createStore' + ' | ' + new Date() + ' | ' + '\n' + e);
            throw e;
        }
        finally {
            if (!(kaspiSettings === null || kaspiSettings === void 0 ? void 0 : kaspiSettings.isAuthorized)) {
                await this.storeModel.deleteOne({ _id: newStore._id });
            }
        }
    }
    async createTestStore(userId) {
        const user = await this.userService.findUserById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('Пользователь не найден');
        }
        const existingStore = await this.storeModel.findOne({ userId });
        if (existingStore) {
            throw new common_1.BadRequestException('У вас уже есть магазин. Удалите его перед созданием нового тестового.');
        }
        const marketplaceId = new mongoose_1.Types.ObjectId();
        const newStore = await new this.storeModel({
            userId: user._id,
            login: 'test',
            password: '',
            marketplaceId,
            maxDempingProducts: 99999,
            requestType: 'NEW',
            isTest: true,
            expireDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
            name: 'Demo Kaspi Store',
            slug: 'demo-kaspi-store',
            storeId: 'KASPI_DEMO_001',
            url: 'https://kaspi.kz/shop/demo',
            isStarted: true,
            mainCity: { id: '750000000', name: 'Алматы', isDempingOnlyThisCity: false, dempingCityId: '750000000' },
            cityLimit: 3,
            isAutoRaise: true,
            phone: user.email,
        }).save();
        const products = [
            { sku: 'DEMO-001', name: 'Samsung Galaxy S24 Ultra 256GB', price: 549990, brand: 'Samsung', category: 'Смартфоны', isDemping: true, isActive: true, amount: 15, place: 1, purchasePrice: 450000 },
            { sku: 'DEMO-002', name: 'Apple iPhone 15 Pro Max 256GB', price: 699990, brand: 'Apple', category: 'Смартфоны', isDemping: false, isActive: true, amount: 8, place: 3, purchasePrice: 600000 },
            { sku: 'DEMO-003', name: 'Xiaomi 14 Ultra 512GB', price: 399990, brand: 'Xiaomi', category: 'Смартфоны', isDemping: true, isActive: true, amount: 25, place: 2, purchasePrice: 320000 },
            { sku: 'DEMO-004', name: 'Sony WH-1000XM5 Наушники', price: 149990, brand: 'Sony', category: 'Наушники', isDemping: false, isActive: true, amount: 30, place: 1, purchasePrice: 110000 },
            { sku: 'DEMO-005', name: 'MacBook Air M3 15 256GB', price: 599990, brand: 'Apple', category: 'Ноутбуки', isDemping: false, isActive: false, amount: 0, place: 5, purchasePrice: 500000 },
            { sku: 'DEMO-006', name: 'Samsung Galaxy Watch 6 Classic', price: 179990, brand: 'Samsung', category: 'Умные часы', isDemping: true, isActive: true, amount: 12, place: 1, purchasePrice: 140000 },
            { sku: 'DEMO-007', name: 'Apple AirPods Pro 2', price: 119990, brand: 'Apple', category: 'Наушники', isDemping: true, isActive: true, amount: 40, place: 2, purchasePrice: 90000 },
            { sku: 'DEMO-008', name: 'Dyson V15 Detect', price: 349990, brand: 'Dyson', category: 'Пылесосы', isDemping: false, isActive: true, amount: 5, place: 4, purchasePrice: 280000 },
        ];
        const ProductModel = this.productService['productModel'];
        for (const p of products) {
            await new ProductModel({
                storeId: newStore._id,
                sku: p.sku,
                name: p.name,
                price: p.price,
                availableMinPrice: Math.floor(p.price * 0.85),
                availableMaxPrice: Math.floor(p.price * 1.15),
                url: 'https://kaspi.kz/shop/p/' + p.sku,
                brand: p.brand,
                category: p.category,
                img: '',
                isDemping: p.isDemping,
                isActive: p.isActive,
                amount: p.amount,
                place: p.place,
                purchasePrice: p.purchasePrice,
                masterProduct: { sku: p.sku, name: p.name },
                cityData: [],
                cityPrices: [],
                isAutoRaise: true,
                dempingPrice: 1,
                marginPercent: 10,
                bonus: 5,
                maxBonus: 60,
                minBonus: 5,
                loanPeriod: 24,
            }).save();
        }
        return {
            message: 'Тестовый магазин создан',
            storeId: newStore._id,
            storeName: newStore.name,
            productsCount: products.length,
        };
    }
    async sendStorePinCode(storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeModel.findOne({ _id: storeId });
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        if (!store.phone) {
            throw new common_1.BadRequestException('Магазин авторизован не по номеру телефона');
        }
        const lockKey = `sms_send_lock:${store.phone}`;
        const lockAcquired = await this.redisClient.setNX(lockKey, '1');
        if (!lockAcquired) {
            throw new common_1.BadRequestException('Код уже отправлен. Пожалуйста, подождите 60 секунд перед повторной отправкой.');
        }
        await this.redisClient.expire(lockKey, 60);
        try {
            const response = await this.kaspiService.sendPinCode(store.phone);
            if (response.isError) {
                throw new common_1.InternalServerErrorException('Что-то пошло не так');
            }
            if (response.statusCode === 200 && response.cookie && response.userAgent) {
                await this.storeModel.updateOne({
                    _id: store._id,
                }, {
                    cookie: response.cookie,
                    userAgent: response.userAgent,
                });
                return;
            }
            throw new common_1.InternalServerErrorException('Что-то пошло не так');
        }
        catch (error) {
            await this.redisClient.del(lockKey);
            throw error;
        }
    }
    async createStorePhone(dto, userId) {
        const startTime = Date.now();
        dto.phone = dto.phone.replace(/[^+\d]/g, '');
        const [user, countStores, marketplace, foundStore] = await Promise.all([
            this.userService.findUserById(userId),
            this.storeModel.countDocuments({ userId }),
            this.marketplaceService.getMarketplace(dto.marketplaceId),
            this.storeModel.findOne({
                phone: dto.phone,
                marketplaceId: dto.marketplaceId,
            }).select('_id').lean(),
        ]);
        if (!user) {
            throw new common_1.UnauthorizedException();
        }
        if (countStores >= user.storeLimit) {
            throw new common_1.BadRequestException(store_constants_1.MAX_STORE_ERROR);
        }
        if (!marketplace) {
            throw new common_1.NotFoundException(marketplace_constants_1.MARKETPLACE_NOT_FOUND_ERROR);
        }
        if (foundStore) {
            throw new common_1.BadRequestException(store_constants_1.STORE_ALREADY_EXISTS_ERROR);
        }
        if (marketplace.name !== 'Kaspi') {
            throw new common_1.BadRequestException();
        }
        const lockKey = `sms_send_lock:${dto.phone}`;
        const lockAcquired = await this.redisClient.setNX(lockKey, '1');
        if (!lockAcquired) {
            throw new common_1.BadRequestException('Код уже отправлен. Пожалуйста, подождите 60 секунд перед повторной отправкой.');
        }
        await this.redisClient.expire(lockKey, 60);
        try {
            const kaspiRequest = await this.kaspiService.sendPinCode(dto.phone);
            metrics_1.metrics.histogram('store-registration-create-store-phone-duration', Date.now() - startTime, [
                `isError:${kaspiRequest.isError}`,
                `statusCode:${kaspiRequest.statusCode}`,
            ]);
            if (kaspiRequest.isError) {
                throw new common_1.InternalServerErrorException('Не удалось отправить код на ваш телефон, пожалуйста попробуйте еще раз');
            }
            const payload = {
                cookie: kaspiRequest.cookie,
                userAgent: kaspiRequest.userAgent,
                phone: dto.phone,
                marketplaceId: dto.marketplaceId,
                sessionId: kaspiRequest.sessionId || '',
            };
            const token = (0, kaspi_tmp_util_1.createKaspiToken)(payload, userId, 5 * 60 * 1000);
            return { token, ttlMs: 5 * 60 * 1000 };
        }
        catch (error) {
            await this.redisClient.del(lockKey);
            throw error;
        }
    }
    async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async reAuthStoreByPhone(dto) {
        dto.phone = dto.phone.replace(/[^+\d]/g, '');
        if (!(0, mongoose_1.isValidObjectId)(dto.storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        let store = await this.storeModel.findOne({ _id: dto.storeId });
        if (!store)
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        const kaspiRequest = await this.kaspiService.sendPinCode(dto.phone);
        metrics_1.metrics.histogram('kaspi-store-reauth-store-by-phone', 1, [
            `isError:${kaspiRequest.isError}`,
            `response:${kaspiRequest.statusCode}`,
            `store:${store.name}-${store._id}`,
        ]);
        if (kaspiRequest.isError) {
            throw new common_1.InternalServerErrorException('Не удалось отправить код на ваш телефон, пожалуйста попробуйте еще раз');
        }
        const payload = {
            cookie: kaspiRequest.cookie,
            userAgent: kaspiRequest.userAgent,
            phone: dto.phone,
            marketplaceId: store.marketplaceId.toString(),
            sessionId: kaspiRequest.sessionId
        };
        const token = (0, kaspi_tmp_util_1.createKaspiToken)(payload, store.userId.toString(), 5 * 60 * 1000);
        return { token, ttlMs: 5 * 60 * 1000 };
    }
    async reVerifyPhoneNumber(dto) {
        if (!(0, mongoose_1.isValidObjectId)(dto.storeId))
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        let store = await this.storeModel.findOne({ _id: dto.storeId });
        if (!store)
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        const tmp = (0, kaspi_tmp_util_1.verifyKaspiToken)(dto.token, store.userId.toString());
        if (!tmp) {
            throw new common_1.BadRequestException('Сессия верификации не найдена или истекла. Пожалуйста, начните заново.');
        }
        const result = await this.kaspiService.verifyStorePhone(dto.pin, tmp.cookie, tmp.userAgent, tmp.sessionId);
        metrics_1.metrics.histogram('kaspi-store-reverify-phone-number', 1, [
            `isError:${result.isError}`,
            `response:${result.statusCode}`,
            `store:${store.name}-${store._id}`,
        ]);
        if (!(result === null || result === void 0 ? void 0 : result.isError) && result.statusCode === 200) {
            await this.storeModel.updateOne({ _id: store._id }, { cookie: result.cookie, isBadCredentials: false });
            return { ok: true };
        }
        if (result.statusCode === 401) {
            throw new common_1.BadRequestException('Магазин по данному номеру не зарегистрирован в Kaspi, пожалуйста пройдите регистрацию в Kaspi');
        }
        throw new common_1.BadRequestException('Неправильный SMS код');
    }
    async verifyPhoneNumber(dto, userId) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
        console.log('[^]' + ' store.service verifyPhoneNumber START' + ' | ' + new Date() + ' | ' + `userId: ${userId}`);
        console.log('[^]' + ' store.service verifyPhoneNumber START' + ' | ' + new Date() + ' | ' + `userId: ${userId}, token: ${dto.token ? 'есть' : 'нет'}, pin: ${dto.pin ? 'есть' : 'нет'}`);
        const startTime = Date.now();
        const tmp = (0, kaspi_tmp_util_1.verifyKaspiToken)(dto.token, userId);
        console.log('tmp', tmp);
        if (!tmp) {
            console.log('[^]' + ' store.service verifyPhoneNumber NO_SESSION' + ' | ' + new Date() + ' | ' + `userId: ${userId}`);
            throw new common_1.BadRequestException('Сессия верификации не найдена или истекла. Пожалуйста, начните заново.');
        }
        console.log('[^]' + ' store.service verifyPhoneNumber SESSION_FOUND' + ' | ' + new Date() + ' | ' + `userId: ${userId}, cookie: ${tmp.cookie ? 'есть' : 'нет'}, userAgent: ${tmp.userAgent ? 'есть' : 'нет'}`);
        const [user, countStores] = await Promise.all([
            this.userService.findUserById(userId),
            this.storeModel.countDocuments({ userId }),
        ]);
        if (!user) {
            throw new common_1.NotFoundException(store_constants_1.USER_NOT_FOUND_ERROR);
        }
        if (countStores >= user.storeLimit) {
            throw new common_1.BadRequestException(store_constants_1.MAX_STORE_ERROR);
        }
        console.log('[^]' + ' store.service verifyPhoneNumber BEFORE_VERIFY_STORE_PHONE' + ' | ' + new Date() + ' | ' +
            `userId: ${userId}, pin length: ${((_a = dto.pin) === null || _a === void 0 ? void 0 : _a.length) || 0}, cookie length: ${((_b = tmp.cookie) === null || _b === void 0 ? void 0 : _b.length) || 0}, userAgent length: ${((_c = tmp.userAgent) === null || _c === void 0 ? void 0 : _c.length) || 0}, sessionId: ${tmp.sessionId ? 'есть' : 'нет'}`);
        let result;
        try {
            result = await this.kaspiService.verifyStorePhone(dto.pin, tmp.cookie, tmp.userAgent, tmp.sessionId);
        }
        catch (error) {
            console.error('[^]' + ' store.service verifyPhoneNumber VERIFY_STORE_PHONE_ERROR' + ' | ' + new Date() + ' | ' +
                `userId: ${userId}, error: ${(error === null || error === void 0 ? void 0 : error.message) || 'unknown'}, stack: ${((_d = error === null || error === void 0 ? void 0 : error.stack) === null || _d === void 0 ? void 0 : _d.substring(0, 200)) || 'нет'}`);
            throw error;
        }
        console.log('[^]' + ' store.service verifyPhoneNumber VERIFY_STORE_PHONE_RESULT' + ' | ' + new Date() + ' | ' +
            `userId: ${userId}, statusCode: ${result === null || result === void 0 ? void 0 : result.statusCode}, isError: ${result === null || result === void 0 ? void 0 : result.isError}, hasCookie: ${!!((result === null || result === void 0 ? void 0 : result.cookie) && result.cookie.length > 0)}, cookieLength: ${((_e = result === null || result === void 0 ? void 0 : result.cookie) === null || _e === void 0 ? void 0 : _e.length) || 0}, hasStoreId: ${!!((result === null || result === void 0 ? void 0 : result.storeId) && result.storeId.length > 0)}, storeId: ${(result === null || result === void 0 ? void 0 : result.storeId) || 'нет'}`);
        metrics_1.metrics.histogram('store-registration-verify-phone-duration', Date.now() - startTime, [
            `isError:${result.isError}`,
            `statusCode:${result.statusCode}`,
        ]);
        if ((result === null || result === void 0 ? void 0 : result.statusCode) === 401) {
            console.error('[^]' + ' store.service verifyPhoneNumber ERROR_401' + ' | ' + new Date() + ' | ' + `userId: ${userId}, storeId: ${(result === null || result === void 0 ? void 0 : result.storeId) || 'нет'}`);
            throw new common_1.BadRequestException('Магазин по данному номеру не зарегистрирован в Kaspi, пожалуйста пройдите регистрацию в Kaspi');
        }
        if ((result === null || result === void 0 ? void 0 : result.isError) || (result === null || result === void 0 ? void 0 : result.statusCode) !== 200) {
            console.error('[^]' + ' store.service verifyPhoneNumber VERIFY_ERROR' + ' | ' + new Date() + ' | ' +
                `userId: ${userId}, statusCode: ${result.statusCode}, isError: ${result.isError}`);
            throw new common_1.BadRequestException('Неправильный SMS код');
        }
        console.log('[^]' + ' store.service verifyPhoneNumber VERIFY_SUCCESS' + ' | ' + new Date() + ' | ' +
            `userId: ${userId}, storeId: ${result.storeId}`);
        console.log('[^]' + ' store.service verifyPhoneNumber BEFORE_GET_STORE_DATA' + ' | ' + new Date() + ' | ' +
            `userId: ${userId}, cookie length: ${((_f = result.cookie) === null || _f === void 0 ? void 0 : _f.length) || 0}, userAgent length: ${((_g = result.userAgent) === null || _g === void 0 ? void 0 : _g.length) || 0}, storeId: ${result.storeId || 'нет'}`);
        let storeData;
        try {
            storeData = await this.kaspiService.getStoreData(result.cookie, result.userAgent || '', result.storeId);
        }
        catch (error) {
            console.error('[^]' + ' store.service verifyPhoneNumber GET_STORE_DATA_ERROR' + ' | ' + new Date() + ' | ' +
                `userId: ${userId}, error: ${(error === null || error === void 0 ? void 0 : error.message) || 'unknown'}, stack: ${((_h = error === null || error === void 0 ? void 0 : error.stack) === null || _h === void 0 ? void 0 : _h.substring(0, 200)) || 'нет'}`);
            throw error;
        }
        console.log('[^]' + ' store.service verifyPhoneNumber GET_STORE_DATA_RESULT' + ' | ' + new Date() + ' | ' +
            `userId: ${userId}, hasStoreData: ${!!storeData}, storeId: ${(storeData === null || storeData === void 0 ? void 0 : storeData.storeId) || 'нет'}, isAuthorized: ${(storeData === null || storeData === void 0 ? void 0 : storeData.isAuthorized) || false}`);
        console.log(`[STORE_SERVICE] 📥 Данные магазина получены:`, {
            isAuthorized: storeData === null || storeData === void 0 ? void 0 : storeData.isAuthorized,
            hasStoreId: !!((storeData === null || storeData === void 0 ? void 0 : storeData.storeId) && storeData.storeId.length > 0),
            storeId: storeData === null || storeData === void 0 ? void 0 : storeData.storeId,
            name: storeData === null || storeData === void 0 ? void 0 : storeData.name
        });
        if (!storeData.isAuthorized) {
            throw new common_1.BadRequestException('Не удалось авторизоваться в Kaspi, попробуйте заново.');
        }
        const duplicate = await this.storeModel.findOne({
            $or: [{ url: storeData.url }, { storeId: storeData.storeId }]
        }).select('_id').lean();
        if (duplicate) {
            throw new common_1.BadRequestException(store_constants_1.STORE_ALREADY_EXISTS_ERROR);
        }
        console.log(`[STORE_SERVICE] 💾 Создаем новый Store в базе...`);
        const newStore = await new this.storeModel({
            marketplaceId: new mongoose_1.Types.ObjectId(tmp.marketplaceId),
            userId: user._id,
            phone: tmp.phone,
            name: storeData.name,
            storeId: storeData.storeId,
            logo: storeData.logo,
            url: storeData.url,
            cookie: storeData.cookie,
            maxDempingProducts: 99999,
            requestType: 'NEW',
            isTest: countStores === 0,
            expireDate: countStores === 0 ? new Date(Date.now() + 1000 * 60 * 60 * 24 * 3) : new Date(),
        }).save();
        console.log('[^]' + ' store.service verifyPhoneNumber STORE_CREATED' + ' | ' + new Date() + ' | ' + `storeId: ${newStore._id}, name: ${newStore.name}, kaspiStoreId: ${newStore.storeId}`);
        console.log('[^]' + ' store.service verifyPhoneNumber BEFORE_CREATE_USER_CHECK' + ' | ' + new Date() + ' | ' +
            `storeId: ${newStore._id}, result.cookie exists: ${!!(result === null || result === void 0 ? void 0 : result.cookie)}, tmp.userAgent exists: ${!!(tmp === null || tmp === void 0 ? void 0 : tmp.userAgent)}, storeData.storeId exists: ${!!(storeData === null || storeData === void 0 ? void 0 : storeData.storeId)}`);
        const resultUserAgent = result.userAgent || tmp.userAgent;
        const hasResultCookie = !!((result === null || result === void 0 ? void 0 : result.cookie) && result.cookie.length > 0);
        const hasUserAgent = !!(resultUserAgent && resultUserAgent.length > 0);
        const hasStoreDataStoreId = !!((storeData === null || storeData === void 0 ? void 0 : storeData.storeId) && storeData.storeId.length > 0);
        console.log('[^]' + ' store.service verifyPhoneNumber CHECK_CONDITIONS' + ' | ' + new Date() + ' | ' +
            `storeId: ${newStore._id}, hasCookie: ${hasResultCookie}, hasUserAgent: ${hasUserAgent}, hasKaspiStoreId: ${hasStoreDataStoreId}`);
        console.log('[^]' + ' store.service verifyPhoneNumber CHECK_CONDITIONS_DETAILS' + ' | ' + new Date() + ' | ' +
            `result.cookie length: ${((_j = result === null || result === void 0 ? void 0 : result.cookie) === null || _j === void 0 ? void 0 : _j.length) || 0}, result.userAgent: ${result.userAgent ? 'есть' : 'нет'}, tmp.userAgent length: ${((_k = tmp === null || tmp === void 0 ? void 0 : tmp.userAgent) === null || _k === void 0 ? void 0 : _k.length) || 0}, storeData.storeId: ${(storeData === null || storeData === void 0 ? void 0 : storeData.storeId) || 'нет'}`);
        if (!result.cookie || result.cookie.length === 0) {
            console.log('[^]' + ' store.service verifyPhoneNumber SKIP_NO_COOKIE' + ' | ' + new Date() + ' | ' + `storeId: ${newStore._id}, result.cookie: ${result.cookie}`);
        }
        else if (!resultUserAgent || resultUserAgent.length === 0) {
            console.log('[^]' + ' store.service verifyPhoneNumber SKIP_NO_USERAGENT' + ' | ' + new Date() + ' | ' + `storeId: ${newStore._id}, resultUserAgent: ${resultUserAgent}`);
        }
        else if (!storeData.storeId || storeData.storeId.length === 0) {
            console.log('[^]' + ' store.service verifyPhoneNumber SKIP_NO_KASPISTOREID' + ' | ' + new Date() + ' | ' + `storeId: ${newStore._id}, storeData.storeId: ${storeData.storeId}`);
        }
        else {
            console.log('[^]' + ' store.service verifyPhoneNumber ALL_CONDITIONS_MET' + ' | ' + new Date() + ' | ' +
                `storeId: ${newStore._id}, kaspiStoreId: ${storeData.storeId}, cookieLength: ${((_l = result.cookie) === null || _l === void 0 ? void 0 : _l.length) || 0}, userAgentLength: ${(resultUserAgent === null || resultUserAgent === void 0 ? void 0 : resultUserAgent.length) || 0}`);
            console.log('[^]' + ' store.service verifyPhoneNumber CALLING_CREATE_USER' + ' | ' + new Date() + ' | ' +
                `storeId: ${newStore._id}, kaspiStoreId: ${storeData.storeId}`);
            try {
                const cookieToUse = result.cookie;
                const userAgentToUse = resultUserAgent;
                console.log('[^]' + ' store.service verifyPhoneNumber CREATE_USER_PARAMS' + ' | ' + new Date() + ' | ' +
                    `storeId: ${newStore._id}, kaspiStoreId: ${storeData.storeId}, cookieSource: ${result.cookie ? 'result' : storeData.cookie ? 'storeData' : 'newStore'}, cookieLength: ${(cookieToUse === null || cookieToUse === void 0 ? void 0 : cookieToUse.length) || 0}, userAgentLength: ${(userAgentToUse === null || userAgentToUse === void 0 ? void 0 : userAgentToUse.length) || 0}`);
                const createUserPromise = this.kaspiService.createKaspiUser({
                    storeId: newStore._id.toString(),
                    kaspiStoreId: storeData.storeId,
                    cookie: cookieToUse,
                    userAgent: userAgentToUse,
                });
                console.log('[^]' + ' store.service verifyPhoneNumber CREATE_USER_PROMISE_CREATED' + ' | ' + new Date() + ' | ' + `storeId: ${newStore._id}`);
                createUserPromise.then((createUserResult) => {
                    console.log('[^]' + ' store.service verifyPhoneNumber CREATE_USER_RESULT' + ' | ' + new Date() + ' | ' +
                        `storeId: ${newStore._id}, success: ${createUserResult.success}, hasEmail: ${!!createUserResult.email}, hasPassword: ${!!createUserResult.password}, error: ${createUserResult.error || 'нет'}`);
                    if (createUserResult.success && createUserResult.email) {
                        return this.storeModel.updateOne({ _id: newStore._id }, {
                            $set: {
                                login: createUserResult.email,
                            },
                        }).then(() => {
                            console.log('[^]' + ' store.service verifyPhoneNumber STORE_UPDATED_WITH_EMAIL' + ' | ' + new Date() + ' | ' +
                                `storeId: ${newStore._id}, email: ${createUserResult.email}, password: будет обновлен в фоне`);
                            if (createUserResult.password) {
                                return this.storeModel.updateOne({ _id: newStore._id }, {
                                    $set: {
                                        password: createUserResult.password,
                                    },
                                }).then(() => {
                                    console.log('[^]' + ' store.service verifyPhoneNumber STORE_UPDATED_WITH_PASSWORD' + ' | ' + new Date() + ' | ' +
                                        `storeId: ${newStore._id}, password: получен сразу`);
                                });
                            }
                            else {
                                console.log('[^]' + ' store.service verifyPhoneNumber PASSWORD_WILL_BE_UPDATED_IN_BACKGROUND' + ' | ' + new Date() + ' | ' +
                                    `storeId: ${newStore._id}, password: будет получен в фоне через auth-api`);
                            }
                        });
                    }
                    else {
                        console.error('[^]' + ' store.service verifyPhoneNumber CREATE_USER_FAILED_STORE_NOT_UPDATED' + ' | ' + new Date() + ' | ' +
                            `storeId: ${newStore._id}, success: ${createUserResult.success}, hasEmail: ${!!createUserResult.email}, error: ${createUserResult.error || 'unknown'}`);
                        console.error('[^]' + ' store.service verifyPhoneNumber REASON' + ' | ' + new Date() + ' | ' +
                            `Store НЕ обновлен, т.к. пользователь не создан в Kaspi. Email (если был создан) не будет сохранен, т.к. он бесполезен без пользователя в Kaspi.`);
                    }
                }).catch((error) => {
                    console.error('[^]' + ' store.service verifyPhoneNumber CREATE_USER_ERROR' + ' | ' + new Date() + ' | ' +
                        `storeId: ${newStore._id}, error: ${(error === null || error === void 0 ? void 0 : error.message) || 'unknown'}`);
                    if (error === null || error === void 0 ? void 0 : error.message) {
                        console.error('[STORE_SERVICE] Error message:', error.message);
                    }
                    if (error === null || error === void 0 ? void 0 : error.response) {
                        console.error('[STORE_SERVICE] Error response:', error.response.status, error.response.data);
                    }
                    if (error === null || error === void 0 ? void 0 : error.stack) {
                        console.error('[STORE_SERVICE] Error stack:', error.stack.substring(0, 300));
                    }
                });
            }
            catch (error) {
                console.error('[STORE_SERVICE] ❌ Failed to call createKaspiUser:', error);
                console.error('[STORE_SERVICE]    Error message:', error === null || error === void 0 ? void 0 : error.message);
                console.error('[STORE_SERVICE]    Error stack:', (_m = error === null || error === void 0 ? void 0 : error.stack) === null || _m === void 0 ? void 0 : _m.substring(0, 300));
            }
        }
        metrics_1.metrics.histogram('store-registration-complete-duration', Date.now() - startTime, [
            `storeId:${newStore._id}`,
            `isTest:${newStore.isTest}`,
        ]);
        console.log('[^]' + ' store.service verifyPhoneNumber SUCCESS' + ' | ' + new Date() + ' | ' +
            `storeId: ${newStore._id}, duration: ${Date.now() - startTime}ms`);
        return {
            _id: newStore._id,
            userId: newStore.userId,
        };
    }
    async updateStoreData(storeId) {
        try {
            const store = await this.storeModel.findOne({ _id: storeId });
            if (!store) {
                throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
            }
            console.log(`UPDATING STORE DATA: ${store.name} | ${new Date()}`);
            if (!store.cookie) {
                throw new common_1.BadRequestException(store_constants_1.KASPI_BAD_CREDENTIALS_ERROR);
            }
            const storeData = await this.kaspiService.getStoreData(store.cookie, '', store.storeId);
            if (storeData.isAuthorized && storeData.storeId) {
                await this.storeModel.updateOne({
                    _id: store._id,
                }, {
                    name: storeData.name,
                    url: storeData.url,
                    logo: storeData.logo,
                    storeId: storeData.storeId,
                });
            }
            else if (!storeData.isAuthorized && !storeData.isError) {
                await this.storeModel.updateOne({
                    _id: store._id,
                }, {
                    isBadCredentials: true,
                    unauthDate: store.unauthDate || new Date(),
                });
            }
            else {
                throw new common_1.BadRequestException(store_constants_1.KASPI_BAD_CREDENTIALS_ERROR);
            }
        }
        catch (e) {
            console.log('[^]' + ' store.sarvice updateStoreData' + ' | ' + new Date() + ' | ' + '\n' + e);
        }
    }
    async updateStoreName(storeId) {
        try {
            const store = await this.storeModel.findOne({ _id: storeId });
            if (!store) {
                throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
            }
            console.log(`UPDATING STORE DATA: ${store.name} | ${new Date()}`);
            if (!store.cookie) {
                throw new common_1.BadRequestException(store_constants_1.KASPI_BAD_CREDENTIALS_ERROR);
            }
            const storeData = await this.kaspiService.getStoreData(store.cookie, '', store.storeId);
            if (storeData.isAuthorized && storeData.storeId) {
                await this.storeModel.updateOne({
                    _id: store._id,
                }, {
                    name: storeData.name,
                    url: storeData.url,
                    logo: storeData.logo,
                    storeId: storeData.storeId,
                });
            }
            else if (!storeData.isAuthorized && !storeData.isError) {
                await this.storeModel.updateOne({
                    _id: store._id,
                }, {
                    isBadCredentials: true,
                    unauthDate: store.unauthDate || new Date(),
                });
            }
            else {
                throw new common_1.BadRequestException(store_constants_1.KASPI_BAD_CREDENTIALS_ERROR);
            }
        }
        catch (e) {
            console.log('[^]' + ' store.sarvice updateStoreName' + ' | ' + new Date() + ' | ' + '\n' + e);
        }
    }
    async deleteStore(storeId) {
        const foundStore = await this.storeModel.findOne({ _id: storeId });
        if (!foundStore) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        await this.storeModel.deleteOne({ _id: foundStore._id });
    }
    async updateStartOrStop(dto, storeId, userId) {
        const store = await this.storeModel.findOne({ _id: storeId, userId });
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        await this.storeModel.updateOne({
            _id: store._id,
        }, {
            isStarted: dto.value,
        });
        await new this.storeStateHistoryModel({
            storeId: store._id,
            isStarted: dto.value,
            author: 'USER',
            authorId: userId,
        }).save();
    }
    async getStoreStatistics(minusDay = 0) {
        let lteDate = new Date();
        if (minusDay !== 0) {
            lteDate = new Date(new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - minusDay, 23, 59, 59, 999)).getTime() -
                6 * 60 * 60 * 1000);
        }
        let date = new Date(new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - minusDay)).getTime() -
            6 * 60 * 60 * 1000);
        return {
            total: await this.storeModel.count({}),
            started: await this.storeModel.count({ isStarted: true }),
            active: await this.storeModel.count({
                expireDate: {
                    $gte: new Date(),
                },
            }),
            todayActivated: await this.storeModel.count({
                createdAt: {
                    $gte: date,
                    $lte: lteDate,
                },
            }),
            inTest: await this.storeModel.count({
                isTest: true,
                expireDate: {
                    $gte: new Date(),
                },
            }),
        };
    }
    async getStoreConversions(minusDay = 0) {
        let lteDate = new Date();
        if (minusDay !== 0) {
            lteDate = new Date(new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - minusDay, 23, 59, 59, 999)).getTime() -
                6 * 60 * 60 * 1000);
        }
        let fromRegistrationToTestAll = '0';
        let fromRegistrationToTestToday = '0';
        let fromTestToPay = '0';
        let fromRegistrationToPay = '0';
        const allUsers = await this.userService.getAllUsers();
        const allTodayUsers = await this.userService.getAllTodayUsers();
        const allStores = await this.storeModel.count();
        const allTodayStores = await this.storeModel.count({
            createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - minusDay),
                $lte: lteDate,
            },
        });
        const allPaidStores = await this.storeModel.count({ isTest: false });
        const fromRegistrationToTestTodayCount = (allTodayStores / allTodayUsers.length) * 100;
        fromRegistrationToTestAll = this.formatPercent((allStores / allUsers.length) * 100);
        fromRegistrationToTestToday = this.formatPercent(Number.isNaN(fromRegistrationToTestTodayCount) ? 0 : fromRegistrationToTestTodayCount);
        fromTestToPay = this.formatPercent((allPaidStores / allStores) * 100);
        fromRegistrationToPay = this.formatPercent((allPaidStores / allUsers.length) * 100);
        return {
            fromRegistrationToTestAll,
            fromRegistrationToTestToday,
            fromTestToPay,
            fromRegistrationToPay,
        };
    }
    formatPercent(number) {
        return new Intl.NumberFormat('en-IN', {
            maximumSignificantDigits: 3,
        }).format(number);
    }
    async updateExpireDate(storeId, newDate, maxDempProducts = null, marketplaceId) {
        await this.storeModel.updateOne({
            _id: storeId,
        }, {
            $set: Object.assign({ expireDate: newDate, isTest: false }, (maxDempProducts ? { maxDempingProducts: maxDempProducts } : {})),
        });
    }
    async searchStoresByKeyword(keyword) {
        const query = {
            $or: [
                {
                    name: {
                        $regex: keyword || '',
                        $options: 'i',
                    },
                },
            ],
        };
        const stores = await this.storeModel.find(query);
        const result = [];
        for (let store of stores) {
            const marketplace = await this.marketplaceService.getMarketplace(store.marketplaceId.toString());
            const user = await this.userService.findUserById(store.userId.toString());
            result.push({
                marketplaceName: (marketplace === null || marketplace === void 0 ? void 0 : marketplace.name) || '',
                user: {
                    name: user === null || user === void 0 ? void 0 : user.name,
                    surname: user === null || user === void 0 ? void 0 : user.surname,
                    phone: user === null || user === void 0 ? void 0 : user.email,
                },
                name: store.name,
                expireDate: store.expireDate,
                isStarted: store.isStarted,
                _id: store._id,
                cityLimit: store.cityLimit,
            });
        }
        return result;
    }
    async updateKaspiCredentials(userId, storeId, dto) {
        const store = await this.getStoreById(storeId);
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        if (store.userId.toString() !== userId) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        if (!dto.login || !dto.password) {
            throw new common_1.BadRequestException(store_constants_1.KASPI_BAD_CREDENTIALS_ERROR);
        }
        const kaspiSettings = await this.kaspiService.getSettings(dto.login, dto.password, store.storeId);
        if (kaspiSettings.isAuthorized) {
            await this.storeModel.updateOne({
                _id: storeId,
            }, {
                name: kaspiSettings.name,
                logo: kaspiSettings.logo,
                url: kaspiSettings.url,
                login: dto.login,
                password: dto.password,
                isBadCredentials: false,
                unauthDate: null,
                cookie: kaspiSettings.cookie,
                storeId: kaspiSettings.storeId,
            });
            await this.actualizeStoreActiveProdutsHashQueue.add({
                storeId,
            }, {
                removeOnComplete: true,
                priority: 1,
                removeOnFail: true,
                jobId: storeId
            });
        }
        else {
            throw new common_1.BadRequestException(store_constants_1.KASPI_BAD_CREDENTIALS_ERROR);
        }
    }
    async updateMainCity(userId, storeId, dto) {
        const store = await this.storeModel.findOne({ _id: storeId, userId });
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        if (!dto.id) {
            throw new common_1.BadRequestException('ID города не найден');
        }
        const marketplace = await this.marketplaceService.getMarketplace(store.marketplaceId.toString());
        if (!marketplace) {
            throw new common_1.NotFoundException(marketplace_constants_1.MARKETPLACE_NOT_FOUND_ERROR);
        }
        const city = await this.cityService.getCity(marketplace.key, dto.id);
        if (!city) {
            throw new common_1.BadRequestException(store_constants_1.INVALID_CITY_ID_ERROR);
        }
        const storeCity = await this.storeCityService.getStoreCity(store._id.toString(), dto.id);
        if (!storeCity) {
            throw new common_1.BadRequestException(store_constants_1.SOMETHING_WENT_WRONG);
        }
        const mainCityDempingId = storeCity.dempingCityId;
        storeCity.cityId = store.mainCity.id;
        storeCity.dempingCityId = store.mainCity.dempingCityId;
        storeCity.cityName = store.mainCity.name;
        store.mainCity.id = city.id;
        store.mainCity.name = city.name;
        store.mainCity.dempingCityId = mainCityDempingId;
        await this.storeCityService.clearRedisStoresActiveProductsByCityId(store, dto.dempingCityId);
        await store.save();
        await storeCity.save();
        await this.redisClient.del(`storeCities:${storeId}`);
        return {
            store,
            storeCity,
        };
    }
    async updateMainCityData(userId, storeId, dto) {
        const store = await this.storeModel.findOne({ _id: storeId, userId });
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        if (!dto.id) {
            throw new common_1.BadRequestException('ID города не найден');
        }
        const marketplace = await this.marketplaceService.getMarketplace(store.marketplaceId.toString());
        if (!marketplace) {
            throw new common_1.NotFoundException(marketplace_constants_1.MARKETPLACE_NOT_FOUND_ERROR);
        }
        const city = await this.cityService.getCity(marketplace.key, dto.id);
        if (!city) {
            throw new common_1.BadRequestException(store_constants_1.INVALID_CITY_ID_ERROR);
        }
        const storeCities = await this.storeCityService.getStoreCities(storeId);
        const found = await storeCities.filter((v) => v.cityId === city.id);
        if (found.length !== 0) {
            console.log(found);
            throw new common_1.BadRequestException(store_constants_1.INVALID_CITY_ID_ERROR);
        }
        store.mainCity.id = city.id;
        store.mainCity.name = city.name;
        if (marketplace.name === 'Kaspi')
            store.mainCity.dempingCityId = dto.dempingCityId;
        await this.storeCityService.clearRedisStoresActiveProductsByCityId(store, dto.dempingCityId);
        await store.save();
        await this.redisClient.del(`storeCities:${storeId}`);
        return {
            store,
        };
    }
    async updateDempingCityId(userId, storeId, dto) {
        const store = await this.storeModel.findOne({ _id: storeId, userId });
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        if (!dto.id) {
            throw new common_1.BadRequestException('ID города не найден');
        }
        const marketplace = await this.marketplaceService.getMarketplace(store.marketplaceId.toString());
        if (!marketplace) {
            throw new common_1.NotFoundException(marketplace_constants_1.MARKETPLACE_NOT_FOUND_ERROR);
        }
        const city = await this.cityService.getCity(marketplace.key, dto.id);
        if (!city) {
            throw new common_1.BadRequestException(store_constants_1.INVALID_CITY_ID_ERROR);
        }
        const storeCity = await this.storeCityService.getStoreCity(store._id.toString(), dto.id);
        const mainCityDempingId = storeCity.dempingCityId;
        storeCity.cityId = store.mainCity.id;
        storeCity.dempingCityId = store.mainCity.dempingCityId;
        storeCity.cityName = store.mainCity.name;
        console.log('New StoreCity', storeCity);
        store.mainCity.id = city.id;
        store.mainCity.name = city.name;
        store.mainCity.dempingCityId = mainCityDempingId;
        console.log('New mainCity', store.mainCity);
        return {
            cityId: dto.id,
            cityName: city.name,
        };
    }
    async isValidCityId(cityId) {
        const city = await this.marketplaceCityModel.findOne({ id: cityId });
        return !!city;
    }
    async updateDempingOnlyThisCity(userId, storeId, dto) {
        const store = await this.storeModel.findOne({ _id: storeId, userId });
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        store.mainCity.isDempingOnlyThisCity = dto.isDempingOnlyThisCity;
        await store.save();
    }
    async getCityById(id) {
        return this.marketplaceCityModel.findOne({ id: id });
    }
    async getCityIdByName(name) {
        return this.marketplaceCityModel.findOne({ name: name, marketplaceKey: 'KASPI' });
    }
    async updateCookie(storeId, cookie) {
        if (!cookie) {
            return;
        }
        await this.storeModel.updateOne({ _id: storeId }, { cookie });
    }
    async giveNewCity(storeId) {
        const store = await this.storeModel.findOne({ _id: storeId });
        if (store) {
            const oldCityLimit = store.cityLimit;
            await this.storeModel.updateOne({
                _id: storeId,
            }, {
                cityLimit: oldCityLimit + 1,
            });
        }
    }
    async updateDempingPrice(storeId, dto) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeModel.findOne({ _id: storeId });
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        await this.storeModel.updateOne({
            _id: storeId,
        }, {
            dempingPrice: dto.dempingPrice,
        });
    }
    async setIsBadCredentials(store, value) {
        if (value === true) {
            await this.storeModel.updateOne({
                _id: store._id,
            }, {
                isBadCredentials: value,
                isSendPhoneAuthorizationMessage: false,
                unauthDate: store.unauthDate || new Date(),
            });
        }
        else {
            await this.storeModel
                .updateOne({
                _id: store._id,
            }, {
                isBadCredentials: value,
                unauthDate: null,
            })
                .catch((err) => {
                console.log('[^]' + ' store.sarvice setIsBadCredentials' + ' | ' + new Date() + ' | ' + '\n' + err);
            });
        }
    }
    async getCountOfApiTokens() {
        return this.storeModel.count({
            $and: [
                {
                    apiToken: {
                        $ne: '',
                    },
                },
                {
                    apiToken: {
                        $ne: null,
                    },
                },
            ],
            expireDate: {
                $gte: new Date(),
            },
        });
    }
    async calculateCabinetStatistics(storeId, startDateFromWeb, endDateFromWeb) {
        console.log('calculateCabinetStatistics', storeId);
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeModel.findOne({ _id: storeId });
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const topSellingProducts = await this.orderService.getTopSellingProducts(storeId);
        const topMarginProducts = await this.productService.getTopMarginProducts(storeId);
        const topLowMarginProducts = await this.productService.getTopLowMarginProducts(storeId);
        const topLowSellingCities = await this.orderService.getTop5LowSellingCities(storeId);
        const topSellingCities = await this.orderService.getTop5SellingCities(storeId);
        const topHighlyCompetitiveProducts = await this.priceHistoryService.getTop5HighlyCompetitiveProducts(storeId);
        const todayProfit = await this.getProfitFromOrders(storeId, 'today');
        const yesterdayProfit = await this.getProfitFromOrders(storeId, 'yesterday');
        const weekProfit = await this.getProfitFromOrders(storeId, 'week');
        const monthProfit = await this.getProfitFromOrders(storeId, 'month', startDateFromWeb, endDateFromWeb);
        const rangeDataProfit = await this.getProfitFromOrders(storeId, 'rangeData');
        let statistics = await this.storeStatisticsModel.findOne({ storeId });
        if (!statistics) {
            statistics = await new this.storeStatisticsModel({
                storeId,
            }).save();
        }
        const updateData = {
            topSellingProducts,
            topMarginProducts,
            topLowSellingCities,
            topSellingCities,
            topHighlyCompetitiveProducts,
            topLowMarginProducts,
            todayProfit,
            yesterdayProfit,
            weekProfit,
            monthProfit,
            rangeDataProfit,
        };
        await this.storeStatisticsModel.updateOne({
            _id: statistics._id,
        }, updateData);
    }
    async getProfitFromOrders(storeId, dateKey, startDateFromWeb, endDateFromWeb) {
        if (!storeId) {
            return 0;
        }
        const currentDate = new Date();
        let startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0);
        let endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 999);
        if (dateKey === 'yesterday') {
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 0, 0, 0, 0);
            endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 23, 59, 59, 999);
        }
        else if (dateKey === 'week') {
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7, 0, 0, 0, 0);
            endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 999);
        }
        else if (dateKey === 'rangeData') {
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth();
            const firstDayOfThisMonth = new Date(startYear, startMonth, 1);
            const lastDayOfThisMonth = new Date(startYear, startMonth + 1, 0);
            lastDayOfThisMonth.setHours(23, 59, 59);
            startDate = firstDayOfThisMonth;
            endDate = lastDayOfThisMonth;
        }
        else if (dateKey === 'month') {
            startDate = startDateFromWeb;
            endDate = endDateFromWeb;
        }
        const storeInfo = await this.storeModel.aggregate([
            {
                $match: {
                    _id: new mongoose_1.Types.ObjectId(storeId),
                },
            },
            {
                $lookup: {
                    from: 'Order',
                    as: 'orders',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: ['$storeId', new mongoose_1.Types.ObjectId(storeId)],
                                        },
                                        {
                                            $eq: ['$status', 'COMPLETED'],
                                        },
                                        {
                                            $gte: ['$completedDate', startDate],
                                        },
                                        {
                                            $lte: ['$completedDate', endDate],
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            $project: {
                                productCode: 1,
                                totalPrice: 1,
                                quantity: 1,
                                deliveryCost: 1,
                            },
                        },
                    ],
                },
            },
        ]);
        if (storeInfo.length === 0) {
            return 0;
        }
        let todayProfit = 0;
        for (const order of storeInfo[0].orders) {
            const product = await this.productService.getProductByQuery({
                storeId,
                'masterProduct.sku': order.productCode,
            });
            const { totalPrice, quantity, deliveryCost, productCode } = order;
            let margin = 0;
            let availableMinPrice = 0;
            let purchasePrice = 0;
            if (product) {
                availableMinPrice = product.availableMinPrice || 0;
                purchasePrice = (product === null || product === void 0 ? void 0 : product.purchasePrice) || 0;
            }
            else {
                console.log(`PRODUCT NOT FOUND | ${productCode} | ${storeId} | ${new Date()}`);
            }
            try {
                const calculation = await this.analyticsService.calculateProfit(productCode, totalPrice);
                const delivery = calculation.delivery[2].priceWithNDS;
                const comission = ((calculation.comission / 100 * 1.16)) * totalPrice;
                margin = totalPrice - delivery - (purchasePrice || availableMinPrice || 0) * quantity - comission - deliveryCost;
            }
            catch (e) {
            }
            todayProfit += margin;
        }
        return Math.floor(todayProfit);
    }
    async getStoreCabinetStatistics(storeId, filter = 'week') {
        console.log(`GETTING STORE CABINET STATISTICS | ${storeId} | ${new Date()}`);
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeModel.findOne({ _id: storeId });
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        let statistics = await this.storeStatisticsModel.findOne({ storeId });
        if (!statistics) {
            statistics = await new this.storeStatisticsModel({
                storeId,
            }).save();
        }
        if (statistics.updatedAt.getTime() < new Date().getTime() - 1000 * 60 * 5) {
            await this.calculateCabinetStatistics(storeId);
            await this.storeStatisticsModel.updateOne({
                _id: statistics._id,
            }, {
                updatedAt: new Date(),
            });
        }
        const topSellingCities = await this.orderService.getTop5SellingCities(storeId, filter);
        const topSellingProducts = await this.orderService.getTopSellingProducts(storeId, filter);
        const sellingPerDay = await this.orderService.getOrderStatsByStoreId(storeId, filter);
        let profit = statistics.todayProfit;
        if (filter === 'yesterday') {
            profit = statistics.yesterdayProfit;
        }
        else if (filter === 'week') {
            profit = statistics.weekProfit;
        }
        else if (filter === 'rangeData') {
            profit = statistics.rangeDataProfit;
        }
        else if (filter === 'month') {
            profit = statistics.monthProfit;
        }
        return {
            topHighlyCompetitiveProducts: statistics.topHighlyCompetitiveProducts,
            topLowMarginProducts: statistics.topLowMarginProducts,
            topMarginProducts: statistics.topMarginProducts,
            topSellingCities,
            topSellingProducts,
            sellingPerDay,
            profit,
        };
    }
    async updateApiToken(storeId, dto) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeModel.findOne({ _id: storeId });
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        console.log(`SAVING API TOKEN ${dto.apiToken} | ${store.name} | ${new Date()}`);
        const isValidToken = await this.kaspiService.loadLastMonthOrdersFromKaspi(dto.apiToken);
        if (isValidToken) {
            await this.storeModel.updateOne({
                _id: storeId,
            }, {
                apiToken: dto.apiToken,
            });
        }
    }
    async getStoresByQuery(query) {
        return await this.storeModel.find(query);
    }
    async getStoreByQuery(query) {
        return await this.storeModel.findOne(query);
    }
    async getStoreFinishStatistics(storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const records = await this.storeFinishModel.find({ storeId });
        const totalRound = await this.storeFinishModel.count({ storeId });
        let lastRecord = null;
        if (records.length > 0) {
            lastRecord = records[records.length - 1];
        }
        let totalTime = 0;
        let totalCountProducts = 0;
        for (let record of records) {
            totalTime += record.time;
            totalCountProducts += record.productsCount;
        }
        return {
            lastRecord,
            totalRound,
            avgTime: totalTime / records.length,
            avgCountProducts: totalCountProducts / records.length,
        };
    }
    async updateCredentials(storeId, dto) {
        const store = await this.storeModel.findOne({
            _id: new mongoose_1.Types.ObjectId(storeId),
        });
        if (!store) {
            throw new common_1.NotFoundException();
        }
        let apiToken = store.apiToken;
        if (dto.login !== store.login) {
            apiToken = '';
        }
        await this.storeModel.updateOne({
            _id: new mongoose_1.Types.ObjectId(storeId),
        }, {
            login: dto.login,
            password: dto.password,
            cookie: '',
            apiToken,
        });
    }
    async getStorePickupPoints(storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            return [];
        }
        const pickupPoints = await this.kaspiStorePickupPointModel.find({
            storeId: new mongoose_1.Types.ObjectId(storeId),
            status: 'ACTIVE',
        });
        return pickupPoints;
    }
    async getStoreMaxDempingProducts(storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeModel.findOne({ _id: storeId }).select({
            maxDempingProducts: 1,
        });
        if (!store) {
            return 0;
        }
        return store.maxDempingProducts || 0;
    }
    async updateStorePhoneNumber(userId, storeId, dto) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const foundStore = await this.storeModel.findOne({ _id: storeId });
        if (!foundStore) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        if (foundStore.userId.toString() !== userId) {
            throw new common_1.ForbiddenException();
        }
        if (foundStore.phone) {
            throw new common_1.BadRequestException(store_constants_1.PHONE_NUMBER_ALREADY_EXISTS_ERROR);
        }
        dto.phone = dto.phone.replace(/[^+\d]/g, '');
        await this.storeModel.updateOne({
            _id: foundStore._id,
        }, {
            phone: dto.phone,
        });
        dto.phone = dto.phone.replace('+7', '8');
        const response = await this.kaspiService.sendPinCode(dto.phone);
        if (response.isError) {
            throw new common_1.InternalServerErrorException('Что-то пошло не так');
        }
    }
    async loadProductsFromKaspi(userId, storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeModel
            .findOne({
            _id: storeId,
        })
            .select({
            userId: 1,
            name: 1,
            marketplaceId: 1,
            login: 1,
            password: 1,
            isBadCredentials: 1,
            unauthDate: 1,
            cookie: 1,
            changePriceMethod: 1,
        });
        if (!store || (store === null || store === void 0 ? void 0 : store.userId.toString()) !== userId) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const integration = await this.integrationModel.findOne({ storeId: store._id });
        const marketplace = await this.marketplaceService.getMarketplace(store.marketplaceId.toString());
        const foundQueue = await this.productLoadQueue.findOne({
            storeId,
            isProcessing: true,
        });
        let productLoadQueueId;
        if (!foundQueue) {
            const newProductLoadQueue = await new this.productLoadQueue({
                storeId,
            }).save();
            productLoadQueueId = newProductLoadQueue._id;
        }
        else {
            console.log(`QUEUE ALREADY EXISTS | ${store._id} | ${new Date()}`);
            productLoadQueueId = foundQueue._id;
        }
        if ((marketplace === null || marketplace === void 0 ? void 0 : marketplace.key) === 'KASPI') {
            const jobOptions = {
                removeOnComplete: true,
                priority: 1,
                removeOnFail: true,
                jobId: productLoadQueueId.toString(),
            };
            if (integration) {
                await this.loadProductsFromXmlQueue.add({
                    storeId,
                    productLoadQueueId,
                }, {
                    removeOnComplete: true,
                    priority: 1,
                    removeOnFail: true,
                });
            }
            else {
                await this.actualizeKaspiStorePickupPointsQueue.add({
                    storeId: storeId
                }, {
                    removeOnFail: true,
                    removeOnComplete: true,
                    priority: 1
                });
                const isGenerated = await this.techRedisClient.get(`isXmlGenerated:${storeId}`);
                if (isGenerated) {
                    throw new common_1.BadRequestException(`Слишком много запросов. Повторите через 15 минут`);
                }
                await this.loadKaspiActiveProductsByXmlQueue.add({
                    storeId,
                    productLoadQueueId,
                }, jobOptions);
                await this.loadKaspiArchiveProductsByXmlQueue.add({
                    storeId,
                    priority: 1,
                }, jobOptions);
            }
        }
        return {
            message: `Мы начали загрузку товаров по вашему магазину: ${store.name}`,
        };
    }
    async getLoadProductsLastMessage(storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeModel.exists({ _id: storeId });
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const lastQueue = await this.productLoadQueue
            .findOne({
            storeId,
            createdAt: {
                $gte: new Date(new Date().getTime() - 3 * 60 * 60 * 1000),
            },
        })
            .sort({ _id: -1 });
        let messages = [];
        let updatedTotalCount = 0;
        let totalAmount = 0;
        if (lastQueue) {
            const foundMessages = await this.productLoadQueueMessage.find({
                queueId: lastQueue._id,
            });
            if (foundMessages) {
                for (let message of foundMessages) {
                    messages.push({
                        message: message.message,
                        isOk: message.isOk,
                        isError: message.isError,
                        createdAt: message.createdAt,
                    });
                }
                if (messages.length === 0) {
                    return {
                        messages,
                    };
                }
                const foundSum = await this.productLoadQueueSum.find({
                    queueId: lastQueue._id,
                });
                if (foundSum.length === 0) {
                    return {
                        messages,
                    };
                }
                for (let count of foundSum) {
                    updatedTotalCount += Number(count.updatedCount);
                    totalAmount = count.totalAmount;
                }
                if (totalAmount == updatedTotalCount && totalAmount != 0) {
                    messages.push({
                        message: `Загружено: ${updatedTotalCount} из ${totalAmount} товаров. Загрузка завершена`,
                        isOk: true,
                        isError: false,
                        isLoadingFinished: true,
                    });
                    return { messages };
                }
                messages.push({
                    message: `Загружено: ${updatedTotalCount} из ${totalAmount} товаров.`,
                    isOk: true,
                    isError: false,
                });
            }
        }
        return {
            messages,
        };
    }
    async deleteLoadProductsLastMessage(storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeModel.exists({ _id: storeId });
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const queues = await this.productLoadQueue.find({
            storeId,
        });
        for (let queue of queues) {
            await this.productLoadQueueMessage.deleteMany({
                queueId: queue._id,
            });
        }
    }
    async isAuthorized(userId, storeId) {
        if (!storeId) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeModel.findOne({
            userId,
            _id: storeId,
        });
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const isAuth = !store.isBadCredentials;
        return {
            isAuth,
        };
    }
    async notBought() {
        const stores = await this.storeModel.aggregate([
            {
                $match: {
                    expireDate: {
                        $lte: new Date(),
                        $gte: new Date(2023, 0, 1),
                    },
                },
            },
            {
                $group: {
                    _id: '$userId',
                },
            },
        ]);
        console.log(stores.length);
    }
    async didNotRenewTheSubscriptionMonth() {
        const type = did_not_renew_the_subscription_model_1.DidNotRenewTheSubscriptionTypeEnum.MONTH;
        console.log('didNotRenewTheSubscription');
        const fromDate = 7;
        const tillDate = 9;
        const gte = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - tillDate, 0, 0, 0, 0);
        const lte = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - fromDate, 23, 59, 59, 999);
        console.log({
            lte,
            gte,
        });
        const stores = await this.storeModel.aggregate([
            {
                $match: {
                    expireDate: {
                        $gte: gte,
                        $lte: lte,
                    },
                },
            },
            {
                $lookup: {
                    from: 'Payment',
                    localField: '_id',
                    foreignField: 'storeId',
                    as: 'payments',
                    let: { price: '$price' },
                    pipeline: [
                        {
                            $match: {
                                price: {
                                    $ne: 0,
                                },
                            },
                        },
                    ],
                },
            },
            {
                $match: {
                    payments: {
                        $ne: [],
                    },
                },
            },
            {
                $group: {
                    _id: '$userId',
                },
            },
            {
                $lookup: {
                    from: 'DidNotRenewTheSubscription',
                    as: 'types',
                    let: {
                        type: '$type',
                        userId: '$userId',
                    },
                    pipeline: [
                        {
                            $match: {
                                $and: [
                                    {
                                        userId: {
                                            $ne: '$userId',
                                        },
                                    },
                                    {
                                        type: {
                                            $ne: type,
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
            {
                $match: {
                    types: [],
                },
            },
            {
                $project: {
                    userId: '$_id',
                },
            },
        ]);
    }
    async setStartOrStop(storeId, dto) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeModel.findOne({ _id: storeId }).select({ _id: 1, name: 1, mainCity: 1 });
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const products = await this.productService.getAllProductsByStoreId(storeId);
        await Promise.all(products.map(async (product) => {
            if (product.isDemping)
                await this.actualizeProductMerchantsForProductQueue
                    .add({
                    storeId: storeId,
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
        await this.storeModel.updateOne({ _id: storeId }, {
            isStarted: dto.value,
        });
        await new this.storeStateHistoryModel({
            storeId: store._id,
            isStarted: dto.value,
            author: 'USER',
            authorId: dto.userId,
        }).save();
        await this.actualizeStoreActiveProdutsHashQueue.add({
            storeId,
        }, {
            removeOnComplete: true,
            priority: 1,
            removeOnFail: true,
            jobId: storeId
        });
        await this.clearXmlHashAndXmlHаshSumForStoreQueue.add({
            storeId,
        }, {
            removeOnComplete: true,
            priority: 1,
            removeOnFail: true,
        });
    }
    async getGeneralStats(storeId, filter, startDateFromWeb, endDateFromWeb) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeModel.findOne({ _id: storeId });
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        if (startDateFromWeb) {
            startDateFromWeb.setUTCHours(startDateFromWeb.getUTCHours() - 6);
        }
        if (endDateFromWeb) {
            endDateFromWeb.setUTCHours(endDateFromWeb.getUTCHours() - 6);
        }
        const { fromDate, toDate } = this.getDateRangeByFilter(filter, startDateFromWeb, endDateFromWeb);
        const turnover = await this.orderService.getStoreTurnover(store._id, fromDate, toDate);
        const averageAmountOfSells = await this.orderService.getAverageAmountOfSells(store._id, fromDate, toDate, filter);
        const topCity = await this.orderService.getTopCity(store._id, fromDate, toDate);
        const returnOrders = await this.orderService.getReturnOrderStats(store._id, fromDate, toDate);
        const amountOfSells = await this.orderService.getAmountOfSells(store._id, fromDate, toDate);
        const profit = await this.orderService.getStoreProfit(store._id, fromDate, toDate);
        const data = {
            filter,
            turnover,
            averageAmountOfSells,
            topCity,
            return: returnOrders,
            amountOfSells,
            profit,
            createdAt: store.createdAt,
        };
        return data;
    }
    async getTopProducts(storeId, filter) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const products = await this.orderService.getTopSellingProducts(storeId, filter);
        return products;
    }
    async getTopMarginProducts(storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        return this.productService.getTopMarginProducts(storeId);
    }
    async getTopLowMarginProducts(storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        return this.productService.getTopLowMarginProducts(storeId);
    }
    async getChart(storeId, filter, startDateFromWeb, endDateFromWeb) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        if (startDateFromWeb) {
            startDateFromWeb.setUTCHours(startDateFromWeb.getUTCHours() - 6);
        }
        if (endDateFromWeb) {
            endDateFromWeb.setUTCHours(endDateFromWeb.getUTCHours() - 6);
        }
        const { fromDate, toDate } = this.getDateRangeByFilter(filter, startDateFromWeb, endDateFromWeb);
        const data = await this.orderService.getChart(new mongoose_1.Types.ObjectId(storeId), fromDate, toDate, filter);
        return data;
    }
    async getProfit(storeId, filter, startDateFromWeb, endDateFromWeb) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeModel.findOne({ _id: storeId });
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        if (startDateFromWeb) {
            startDateFromWeb.setUTCHours(startDateFromWeb.getUTCHours() - 6);
        }
        if (endDateFromWeb) {
            endDateFromWeb.setUTCHours(endDateFromWeb.getUTCHours() - 6);
        }
        const { fromDate, toDate } = this.getDateRangeByFilter(filter, startDateFromWeb, endDateFromWeb);
        const profit = await this.orderService.getStoreProfit(store._id, fromDate, toDate);
        return profit;
    }
    getDateRangeByFilter(filter, startDateFromWeb, endDateFromWeb) {
        const currentDate = new Date();
        let fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0);
        let toDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 999);
        if (filter === 'yesterday') {
            fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 0, 0, 0, 0);
            toDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 23, 59, 59, 999);
        }
        else if (filter === 'week') {
            fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7, 23, 59, 59, 999);
        }
        if (filter === 'month') {
            if (startDateFromWeb && endDateFromWeb) {
                fromDate = startDateFromWeb;
                toDate = endDateFromWeb;
            }
        }
        else if (filter === 'rangeData') {
            let startDate = new Date();
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth();
            const firstDayOfThisMonth = new Date(startYear, startMonth, 1);
            const lastDayOfThisMonth = new Date(startYear, startMonth + 1, 0);
            lastDayOfThisMonth.setHours(23, 59, 59);
            fromDate = firstDayOfThisMonth;
            toDate = lastDayOfThisMonth;
        }
        return {
            fromDate,
            toDate,
        };
    }
    async formatDashboardExcel(storeId, filter, res) {
        const orderStatusesReport = await this.orderService.getStatusesReport(storeId);
        const generalStatus = await this.getGeneralStats(storeId, filter);
        const topProducts = await this.orderService.getTopSellingProductsByTotalPrice(storeId, filter);
        const topCities = await this.orderService.getTop5SellingCities(storeId, filter, 6);
        const getFilterName = (filter) => {
            if (filter === 'today') {
                return 'Сегодня';
            }
            else if (filter === 'yesterday') {
                return 'Вчера';
            }
            else if (filter === 'week') {
                return 'Неделя';
            }
            else if (filter === 'month') {
                return 'Выбранный Период';
            }
            else if (filter === 'rangeData') {
                return 'Текущий месяц';
            }
        };
        const topProductsData = () => {
            data.push(['Топ товаров по обороту'], ['Название', 'SKU', 'Кол-во продаж', 'Оборот, ₸', 'Маржа, ₸', 'Ссылка']);
            for (let i = 0; i < topProducts.length; i++) {
                data.push([
                    topProducts[i] ? topProducts[i].name : '',
                    topProducts[i] ? topProducts[i]._id : '',
                    topProducts[i] ? topProducts[i].count : '',
                    topProducts[i] ? topProducts[i].totalPrice : '',
                    topProducts[i] ? topProducts[i].profit : '',
                    topProducts[i] ? topProducts[i].url : '',
                ]);
            }
            data.push([]);
        };
        const topCitiesData = () => {
            data.push(['Топ городов по продажам'], ['Город', 'Средняя цена, ₸', 'Кол-во продаж', 'Оборот, ₸', 'Средняя стоимость доставки, ₸']);
            for (let i = 0; i < topCities.length; i++) {
                if (topCities[i] && topCities[i]._id === 'Нет') {
                    continue;
                }
                data.push([
                    topCities[i] ? topCities[i]._id : '',
                    topCities[i] ? Math.round(topCities[i].averagePrice) : '',
                    topCities[i] ? topCities[i].count : '',
                    topCities[i] ? topCities[i].totalPrice : '',
                    topCities[i] ? Math.round(topCities[i].averageDeliveryCost) : '',
                ]);
            }
            data.push([]);
        };
        const data = [
            ['Новые, На подписании', 'Самовывоз', 'Моя Доставка', 'Kaspi Доставка'],
            [
                orderStatusesReport.newAndSignRequiredCount.totalPrice,
                orderStatusesReport.pickupCount.totalPrice,
                orderStatusesReport.deliveryCount.totalPrice,
                orderStatusesReport.kaspiDeliveryCount.totalPrice,
            ],
            [
                'Кол-во заказов: ' + orderStatusesReport.newAndSignRequiredCount.count,
                'Кол-во заказов: ' + orderStatusesReport.pickupCount.count,
                'Кол-во заказов: ' + orderStatusesReport.deliveryCount.count,
                'Кол-во заказов: ' + orderStatusesReport.kaspiDeliveryCount.count,
            ],
            [],
            [getFilterName(filter)],
            [],
            ['Прибыль, ₸', 'Оборот, ₸', 'Продажи', 'Ср. в час', 'Топ город', 'Возврат, ₸'],
            [
                generalStatus.profit.value,
                generalStatus.turnover.value,
                generalStatus.amountOfSells.value,
                generalStatus.averageAmountOfSells.value,
                generalStatus.topCity.value,
                generalStatus.return.value,
            ],
            [],
        ];
        topProductsData();
        topCitiesData();
        const columnWidths = [35, 15, 15, 15, 15, 30];
        const options = {
            '!cols': columnWidths.map((width) => ({ wch: width })),
            '!merges': [
                { s: { r: 4, c: 0 }, e: { r: 4, c: 5 } },
                { s: { r: 9, c: 0 }, e: { r: 9, c: 5 } },
            ],
        };
        const buffer = node_xlsx_1.default.build([{ name: 'SaleScout Dashboard', data, options }]);
        const filePath = path.resolve('SaleScout_Dashboard.xlsx');
        (0, fs_extra_1.writeFileSync)(filePath, buffer);
        res.setHeader('allowDownload', 'true');
        res.sendFile(filePath, async (err) => {
            if (err) {
                console.error('Error sending file:', err);
            }
            else {
                (0, fs_extra_1.unlinkSync)(filePath);
            }
        });
    }
    async getDashboardExcel(storeId, filter, res) {
        const key = `priceListExcelDownloaded: ${storeId}`;
        const limitForDownloading = 5;
        const lastAttemptTimestamp = await this.redisClient.get(key);
        const remainingTimeBeforeNextAttempt = limitForDownloading * 60 * 1000 - (Date.now() - parseInt(lastAttemptTimestamp));
        if (!lastAttemptTimestamp) {
            await this.redisClient.set(key, Date.now().toString(), { EX: limitForDownloading * 60 });
            await this.formatDashboardExcel(storeId, filter, res);
        }
        else {
            throw new common_1.BadRequestException({
                remainingTimeBeforeNextAttempt,
            });
        }
    }
    async showNYDiscount(userId) {
        if (!(0, mongoose_1.isValidObjectId)(userId)) {
            throw new common_1.BadRequestException();
        }
        if (new Date() > new Date(1704045600000)) {
            throw new common_1.BadRequestException();
        }
        const paidStoresCount = await this.storeModel.count({
            userId,
            name: { $ne: '' },
            isTest: false,
            expireDate: {
                $gte: new Date(),
            },
        });
        if (paidStoresCount === 0) {
            return;
        }
        throw new common_1.BadRequestException();
    }
    async updateStoreSlug(storeId, dto) {
        const badNames = ['public', 'icons', 'ru', 'kz', 'ref', 'xdls', 'static', 'js', 'css'];
        const badSubstrings = ['.css', '.png', '.jpg', '.svg', '.html', '.js', '.json', '/'];
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.BadRequestException();
        }
        if (await this.storeModel.findOne({ slug: dto.slug, _id: { $ne: storeId } })) {
            throw new common_1.BadRequestException('Такой ID уже занят');
        }
        for (const substring of badSubstrings) {
            if (dto.slug.indexOf(substring) !== -1) {
                throw new common_1.BadRequestException('ID содржит недопустимые символы');
            }
        }
        if (badNames.includes(dto.slug)) {
            throw new common_1.BadRequestException('Недопустимый ID');
        }
        return await this.storeModel.updateOne({ _id: storeId }, { slug: dto.slug });
    }
    async getStoreUploadLimit(storeId) {
        const merchant = await this.storeModel.findOne({ _id: storeId }, { storeId: 1 });
        if (!(merchant === null || merchant === void 0 ? void 0 : merchant.storeId)) {
            throw new common_1.NotFoundException('Merchant not found');
        }
        const limit = await this.kaspiStoreUploadLimitModel.findOne({ merchantId: merchant.storeId, limitType: 'OFFER' });
        if (!limit) {
            throw new common_1.NotFoundException(`Limit not found for merchant ${merchant.storeId}`);
        }
        return limit;
    }
    async setIsDempingOnLoanPeriod(storeId, dto) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        try {
            await this.storeModel.updateOne({ _id: storeId }, { isDempingOnLoanPeriod: dto.isDempingOnLoanPeriod });
            return { isError: false, message: 'Successfully updated' };
        }
        catch (error) {
            return { isError: true, message: error.message };
        }
    }
    async loadOrdersFromKaspi(userId, storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeModel
            .findOne({
            _id: storeId,
        })
            .select({
            userId: 1,
            name: 1,
            marketplaceId: 1,
            login: 1,
            password: 1,
            isBadCredentials: 1,
            unauthDate: 1,
            cookie: 1,
            changePriceMethod: 1,
        });
        if (!store || (store === null || store === void 0 ? void 0 : store.userId.toString()) !== userId) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const marketplace = await this.marketplaceService.getMarketplace(store.marketplaceId.toString());
        try {
            if (store.login != '' && store.password != '' && (store.isBadCredentials || !store.cookie)) {
                const kaspiCookie = await this.kaspiService.authToKaspi(store.login, store.password);
                if (!kaspiCookie.isAuthorized) {
                    await this.setIsBadCredentials(store, true);
                    await this.updateCookie(store._id.toString(), '');
                    return {
                        isError: true,
                        message: `${store_constants_1.KASPI_BAD_CREDENTIALS_ERROR}`,
                    };
                }
                await this.updateCookie(store._id.toString(), kaspiCookie.cookie);
                await this.setIsBadCredentials(store, false);
            }
            await this.updateStoreData(storeId).catch((e) => {
                console.log('[^]' + ' order.service ' + ' | ' + new Date() + ' | ' + '\n' + e);
            });
        }
        catch (e) {
            console.log('[^]' + ' order.service ' + ' | ' + new Date() + ' | ' + '\n' + e);
            return {
                isError: true,
                message: `Не удалось авторизоваться в Kaspi, пожалуйста попробуйте еще раз`,
            };
        }
        const foundQueue = await this.orderLoadQueue.findOne({
            storeId,
            isProcessing: true,
        });
        let orderLoadQueueId;
        if (!foundQueue) {
            const newOrderLoadQueue = await new this.orderLoadQueue({
                storeId,
            }).save();
            orderLoadQueueId = newOrderLoadQueue._id;
        }
        else {
            console.log(`QUEUE ALREADY EXISTS | ${store._id} | ${new Date()}`);
            orderLoadQueueId = foundQueue._id;
        }
        if ((marketplace === null || marketplace === void 0 ? void 0 : marketplace.key) === 'KASPI') {
            const jobOptions = {
                removeOnComplete: true,
                priority: 1,
                removeOnFail: true,
                jobId: orderLoadQueueId.toString(),
            };
            const state = 'KASPI_DELIVERY';
            console.log(orderLoadQueueId);
            await this.loadKaspiOrdersQueue.add({
                storeId: storeId,
                state,
                status: null,
                dateFrom: new Date().getTime() - 14 * 24 * 60 * 60 * 1000,
                dateTo: null,
                orderLoadQueueId: orderLoadQueueId,
            }, jobOptions);
        }
        return {
            message: `Мы начали загрузку заказов по вашему магазину: ${store.name}`,
        };
    }
    async getLoadOrdersLastMessage(storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeModel.exists({ _id: storeId });
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const lastQueue = await this.orderLoadQueue
            .findOne({
            storeId,
            createdAt: {
                $gte: new Date(new Date().getTime() - 3 * 60 * 60 * 1000),
            },
        })
            .sort({ _id: -1 });
        let messages = [];
        let updatedTotalCount = 0;
        let totalAmount = 0;
        if (lastQueue) {
            const foundMessages = await this.orderLoadQueueMessage.find({
                queueId: lastQueue._id,
            });
            if (foundMessages) {
                for (let message of foundMessages) {
                    messages.push({
                        message: message.message,
                        isOk: message.isOk,
                        isError: message.isError,
                        createdAt: message.createdAt,
                    });
                    totalAmount += message.totalAmount;
                }
                if (messages.length === 0) {
                    return {
                        messages,
                    };
                }
                const foundSum = await this.orderLoadQueueSum.find({
                    queueId: lastQueue._id,
                });
                if (foundSum.length === 0) {
                    return {
                        messages,
                    };
                }
                const first = foundSum[0].totalAmount;
                for (let count of foundSum) {
                    updatedTotalCount += Number(count.updatedCount);
                }
                if (totalAmount == updatedTotalCount && totalAmount != 0) {
                    messages.push({
                        message: `Загружено: ${updatedTotalCount} из ${totalAmount} заказов. Загрузка завершена`,
                        isOk: true,
                        isError: false,
                        isLoadingFinished: true,
                    });
                    return { messages };
                }
                messages.push({
                    message: `Загружено ${updatedTotalCount} из ${totalAmount} заказов.`,
                    isOk: true,
                    isError: false,
                });
            }
        }
        return {
            messages,
        };
    }
    async deleteLoadOrdersLastMessage(storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeModel.exists({ _id: storeId });
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const queues = await this.orderLoadQueue.find({
            storeId,
        });
        for (let queue of queues) {
            await this.orderLoadQueueMessage.deleteMany({
                queueId: queue.id,
            });
        }
    }
    async getTimeWhenNextXmlUpload(storeId) {
        var _a;
        const store = await this.storeModel.findOne({ _id: storeId });
        if (!store) {
            throw new common_1.NotFoundException('Merchant not found');
        }
        if (store.changePriceMethod === 'REQUEST') {
            return null;
        }
        const expire = await this.kaspiStoreUploadLimitModel.findOne({ merchantId: store.storeId, limitType: "FILE" });
        const lastUploadDate = await this.xmlUploadHistoryModel.findOne({ storeId: store._id, uploadStatus: 200 }).sort({ _id: -1 });
        let nextUploadMinTime = Math.max((((_a = lastUploadDate === null || lastUploadDate === void 0 ? void 0 : lastUploadDate.createdAt) === null || _a === void 0 ? void 0 : _a.getTime()) || new Date().getTime()) + 60000 * 15, new Date().getTime() + 60000 * 5);
        if (expire) {
            if (expire.maxCount - expire.uploadedCount == 0) {
                return new Date(Math.max((expire === null || expire === void 0 ? void 0 : expire.expirationDate.getTime()) || 0, nextUploadMinTime));
            }
            if (expire.maxCount - expire.uploadedCount == 1) {
                return new Date(Math.max(expire.expirationDate.getTime() - 60000 * 15, new Date().getTime() + 60000 * 5, nextUploadMinTime));
            }
            return new Date(Math.max(expire.expirationDate.getTime() - 60000, nextUploadMinTime));
        }
        return new Date(nextUploadMinTime);
    }
};
StoreService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_typegoose_1.InjectModel)(order_load_queue_model_1.OrderLoadQueueModel)),
    __param(1, (0, nestjs_typegoose_1.InjectModel)(order_load_queue_message_model_1.OrderLoadQueueMessageModel)),
    __param(2, (0, nestjs_typegoose_1.InjectModel)(order_load_queue_sum_model_1.OrderLoadQueueSumModel)),
    __param(3, (0, nestjs_typegoose_1.InjectModel)(store_model_1.StoreModel)),
    __param(4, (0, nestjs_typegoose_1.InjectModel)(store_statistics_model_1.StoreStatisticsModel)),
    __param(5, (0, nestjs_typegoose_1.InjectModel)(product_load_queue_model_1.ProductLoadQueueModel)),
    __param(6, (0, nestjs_typegoose_1.InjectModel)(product_load_queue_message_model_1.ProductLoadQueueMessageModel)),
    __param(7, (0, nestjs_typegoose_1.InjectModel)(product_load_queue_sum_model_1.ProductLoadQueueSumModel)),
    __param(8, (0, nestjs_typegoose_1.InjectModel)(store_finish_model_1.StoreFinishModel)),
    __param(9, (0, nestjs_typegoose_1.InjectModel)(payment_model_1.PaymentModel)),
    __param(10, (0, nestjs_typegoose_1.InjectModel)(marketplace_city_model_1.MarketplaceCityModel)),
    __param(11, (0, nestjs_typegoose_1.InjectModel)(store_position_metrics_model_1.StorePositionMetricsModel)),
    __param(12, (0, nestjs_typegoose_1.InjectModel)(xml_upload_history_model_1.XmlUploadHistoryModel)),
    __param(15, (0, common_1.Inject)((0, common_1.forwardRef)(() => store_city_service_1.StoreCityService))),
    __param(17, (0, common_1.Inject)((0, common_1.forwardRef)(() => order_service_1.OrderService))),
    __param(18, (0, common_1.Inject)((0, common_1.forwardRef)(() => product_service_1.ProductService))),
    __param(19, (0, common_1.Inject)((0, common_1.forwardRef)(() => price_history_service_1.PriceHistoryService))),
    __param(20, (0, nestjs_typegoose_1.InjectModel)(kaspi_store_pickup_point_model_1.KaspiStorePickupPointModel)),
    __param(22, (0, nestjs_typegoose_1.InjectModel)(store_upload_limit_model_1.KaspiStoreUploadLimitModel)),
    __param(23, (0, bull_1.InjectQueue)('actualize-product-merchants-for-product-queue')),
    __param(24, (0, bull_1.InjectQueue)('load-products-queue')),
    __param(25, (0, bull_1.InjectQueue)('get-kaspi-store-api-token-queue')),
    __param(26, (0, bull_1.InjectQueue)('actualize-kaspi-store-pickup-points-queue')),
    __param(27, (0, bull_1.InjectQueue)('load-kaspi-active-products-client-queue')),
    __param(28, (0, bull_1.InjectQueue)('load-kaspi-active-products-by-xml-queue')),
    __param(29, (0, bull_1.InjectQueue)('load-kaspi-archive-products-by-xml-queue')),
    __param(30, (0, bull_1.InjectQueue)('load-products-from-xml-queue')),
    __param(31, (0, bull_1.InjectQueue)('load-kaspi-archive-products-queue')),
    __param(32, (0, bull_1.InjectQueue)('actualize-product-merchants-queue')),
    __param(33, (0, bull_1.InjectQueue)('actualize-kaspi-store-cities-queue')),
    __param(34, (0, bull_1.InjectQueue)('clear-xml-hash-and-xml-hash-sum-for-store-queue')),
    __param(35, (0, bull_1.InjectQueue)('actualize-store-active-products-hash-queue')),
    __param(36, (0, bull_1.InjectQueue)('load-kaspi-orders-queue')),
    __param(39, (0, nestjs_typegoose_1.InjectModel)(store_wa_model_1.StoreWAModel)),
    __param(40, (0, nestjs_typegoose_1.InjectModel)(store_state_history_model_1.StoreStateHistoryModel)),
    __param(41, (0, nestjs_typegoose_1.InjectModel)(integration_model_1.IntegrationModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, user_service_1.UserService,
        marketplace_service_1.MarketplaceService,
        store_city_service_1.StoreCityService,
        kaspi_service_1.KaspiService,
        order_service_1.OrderService,
        product_service_1.ProductService,
        price_history_service_1.PriceHistoryService, Object, store_wa_service_1.StoreWaService, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, analytics_service_1.AnalyticsService,
        city_service_1.CityService, Object, Object, Object])
], StoreService);
exports.StoreService = StoreService;
//# sourceMappingURL=store.service.js.map