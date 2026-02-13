/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-var-requires */
import {
    BadRequestException,
    ForbiddenException,
    forwardRef,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { MarketplaceService } from 'src/marketplace/marketplace.service'
import { UserService } from 'src/user/user.service'
import { CreateStoreDto } from './dto/create-store.dto'
import { StartStopStoreDto } from './dto/start-stop-store.dto'
import {
    INVALID_CITY_ID_ERROR,
    KASPI_BAD_CREDENTIALS_ERROR,
    MAX_STORE_ERROR,
    PHONE_NUMBER_ALREADY_EXISTS_ERROR,
    SOMETHING_WENT_WRONG,
    STORE_ALREADY_EXISTS_ERROR,
    STORE_NOT_FOUND_ERROR,
    USER_NOT_FOUND_ERROR,
} from './store.constants'
import { StoreModel } from './store.model'
import { StoreWAModel } from '../store-wa/store-wa.model'
import { StoreStateHistoryModel } from './store-state-history.model'
import mongoose, { Types, isValidObjectId } from 'mongoose'
import { UpdateStoreCredentialsDto } from './dto/update-store-credentials.dto'
import { UpdateDempingCityIdDto } from './dto/update-demping-city-id.dto'
import { UpdateDempingCityOnlyDto } from './dto/update-demping-city-only.dto'
import { StoreCityService } from 'src/store-city/store-city.service'
import { KaspiService } from './kaspi.service'
import { KaspiSettingsDto } from './dto/kaspi-settings.dto'
import { UpdateDempingPriceDto } from './dto/update-demping-price.dto'
import { OrderService } from 'src/order/order.service'
import { ProductService } from 'src/product/product.service'
import { PriceHistoryService } from 'src/price-history/price-history.service'
import { StoreStatisticsModel } from './store-statistics.model'
import { UpdateApiTokenDto } from './dto/update-api-token.dto'
import axios from 'axios'
import { StoreFinishModel } from './store-finish.model'
import { MARKETPLACE_NOT_FOUND_ERROR } from 'src/marketplace/marketplace.constants'

import { CreateStorePhoneDto } from './dto/create-store-phone.dto'
import { VerifyExistingStorePhoneDto, VerifyNewStorePhoneDto } from './dto/verify-store-phone.dto'
import { UpdateStorePhoneDto } from './dto/update-store-phone.dto'
import { ProductLoadQueueModel } from './product-load-queue.model'
import { ProductLoadQueueMessageModel } from './product-load-queue-message.model'
import { ProductLoadQueueSumModel } from './product-load-queue-sum.model'
import { StoreWaService } from 'src/store-wa/store-wa.service'
import { DidNotRenewTheSubscriptionTypeEnum } from './did-not-renew-the-subscription.model'
import { SetStartOrStopDto } from './dto/set-start-or-stop.dto'
import { InjectQueue } from '@nestjs/bull'
import { Queue, JobOptions } from 'bull'
import { CronJob } from 'cron'
import { CityService } from 'src/city/city.service'
import { KaspiStorePickupPointModel } from './kaspi-store-pickup-point.model'
import { ReAuthStoreByPhone } from './dto/reAuthStoreByPhone.dto'
import { StorePositionMetricsModel } from './store-position-metrics.model'
import { metrics } from 'src/metrics'
import { unlinkSync, writeFileSync } from 'fs-extra'
import xlsx from 'node-xlsx'
import { Response } from 'express'
import * as path from 'path'
import { createClient } from 'redis'
import { MarketplaceCityModel } from 'src/city/marketplace-city.model'
import { UpdateStoreSlugDto } from './dto/update-store-slug.dto'
import { KaspiStoreUploadLimitModel } from './store-upload-limit.model'
import { XmlUploadHistoryModel } from './xml-upload-history.model'
import { PaymentModel } from 'src/payment/payment.model'
import { OrderLoadQueueMessageModel } from './order-load-queue-message.model'
import { OrderLoadQueueSumModel } from './order-load-queue-sum.model'
import { OrderLoadQueueModel } from './order-load-queue.model'
import { SetIsDempingOnLoanPeriod } from './dto/set-is-demping-on-loan-period'
import { CreateStoreCityDto } from 'src/store-city/dto/create-store-city.dto'
import { UpdateStoreCityDto } from 'src/store-city/dto/update-store-city.dto'
import { UpdateMainCityProductDto } from 'src/product/dto/update-main-city-product'
import { createKaspiToken, KaspiTmpPayload, verifyKaspiToken } from './kaspi-tmp.util'
import { AnalyticsService } from 'src/analytics/analytics.service'
import { IntegrationModel } from './integration.model'

@Injectable()
export class StoreService {
    private readonly redisClient = createClient({
        url: process.env.REDIS_URL || '',
    })
    private readonly techRedisClient = createClient({
        url: process.env.TECH_REDIS_URL || '',
    })
    constructor(
        @InjectModel(OrderLoadQueueModel) private readonly orderLoadQueue: ModelType<OrderLoadQueueModel>,
        @InjectModel(OrderLoadQueueMessageModel) private readonly orderLoadQueueMessage: ModelType<OrderLoadQueueMessageModel>,
        @InjectModel(OrderLoadQueueSumModel) private readonly orderLoadQueueSum: ModelType<OrderLoadQueueSumModel>,
        @InjectModel(StoreModel) private readonly storeModel: ModelType<StoreModel>,
        @InjectModel(StoreStatisticsModel)
        private readonly storeStatisticsModel: ModelType<StoreStatisticsModel>,
        @InjectModel(ProductLoadQueueModel)
        private readonly productLoadQueue: ModelType<ProductLoadQueueModel>,
        @InjectModel(ProductLoadQueueMessageModel)
        private readonly productLoadQueueMessage: ModelType<ProductLoadQueueMessageModel>,
        @InjectModel(ProductLoadQueueSumModel)
        private readonly productLoadQueueSum: ModelType<ProductLoadQueueSumModel>,
        @InjectModel(StoreFinishModel)
        private readonly storeFinishModel: ModelType<StoreFinishModel>,
        @InjectModel(PaymentModel)
        private readonly paymentModel: ModelType<PaymentModel>,
        @InjectModel(MarketplaceCityModel)
        private readonly marketplaceCityModel: ModelType<MarketplaceCityModel>,
        @InjectModel(StorePositionMetricsModel)
        private readonly storePositionMetricsModel: ModelType<StorePositionMetricsModel>,
        @InjectModel(XmlUploadHistoryModel)
        private readonly xmlUploadHistoryModel: ModelType<XmlUploadHistoryModel>,
        private readonly userService: UserService,
        private readonly marketplaceService: MarketplaceService,
       
        @Inject(forwardRef(() => StoreCityService))
        private readonly storeCityService: StoreCityService,
        private readonly kaspiService: KaspiService,
        @Inject(forwardRef(() => OrderService))
        private readonly orderService: OrderService,
        @Inject(forwardRef(() => ProductService))
        private readonly productService: ProductService,
        @Inject(forwardRef(() => PriceHistoryService))
        private readonly priceHistoryService: PriceHistoryService,
        
      

        @InjectModel(KaspiStorePickupPointModel)
        private readonly kaspiStorePickupPointModel: ModelType<KaspiStorePickupPointModel>,
        private readonly storeWaService: StoreWaService,
        @InjectModel(KaspiStoreUploadLimitModel)
        private readonly kaspiStoreUploadLimitModel: ModelType<KaspiStoreUploadLimitModel>,
        @InjectQueue('actualize-product-merchants-for-product-queue') private actualizeProductMerchantsForProductQueue: Queue,
        @InjectQueue('load-products-queue') private loadProductsQueue: Queue,
        @InjectQueue('get-kaspi-store-api-token-queue') private readonly getKaspiStoreApiTokenQueue: Queue,
        @InjectQueue('actualize-kaspi-store-pickup-points-queue') private readonly actualizeKaspiStorePickupPointsQueue: Queue,
        @InjectQueue('load-kaspi-active-products-client-queue') private readonly loadKaspiActiveProductsClientQueue: Queue,
        @InjectQueue('load-kaspi-active-products-by-xml-queue') private readonly loadKaspiActiveProductsByXmlQueue: Queue,
        @InjectQueue('load-kaspi-archive-products-by-xml-queue') private readonly loadKaspiArchiveProductsByXmlQueue: Queue,
        @InjectQueue('load-products-from-xml-queue') private readonly loadProductsFromXmlQueue: Queue,
        @InjectQueue('load-kaspi-archive-products-queue') private readonly loadKaspiArchiveProductsQueue: Queue,
        @InjectQueue('actualize-product-merchants-queue') private readonly actualizeProductMerchantsQueue: Queue,
        @InjectQueue('actualize-kaspi-store-cities-queue') private readonly actualizeKaspiStoreCitiesQueue: Queue,
        @InjectQueue('clear-xml-hash-and-xml-hash-sum-for-store-queue') private readonly clearXmlHashAndXmlHаshSumForStoreQueue: Queue,
        @InjectQueue('actualize-store-active-products-hash-queue') private readonly actualizeStoreActiveProdutsHashQueue: Queue,
        @InjectQueue('load-kaspi-orders-queue') private readonly loadKaspiOrdersQueue: Queue,
        private readonly analyticsService: AnalyticsService,
        private readonly cityService: CityService,
        @InjectModel(StoreWAModel) private readonly storeWaModel: ModelType<StoreWAModel>,
        @InjectModel(StoreStateHistoryModel) private readonly storeStateHistoryModel: ModelType<StoreStateHistoryModel>,
        @InjectModel(IntegrationModel) private readonly integrationModel: ModelType<IntegrationModel>,
    
    ) {
        if (process.env.ENVIRONMENT === 'prod') {
            // this.mailingForExpiredStores()
            this.launchCrons()
        }

        this.test()

        this.redisClient.connect().then(() => {
            console.log(`REDIS IN STORE CONNECTED`)
        })
        this.techRedisClient.connect().then(() => {
            console.log(`TECH REDIS IN STORE CONNECTED`)
        })
    }

    public async test() {
        // const stores = await this.storeModel.find({ expireDate: { $gte: new Date() } }).sort({ _id: 1 })
        // for (const store of stores) {
        //     console.log(store.name)
        //     await this.calculateCabinetStatistics(store._id.toString())
        // }
        // this.calculateCabinetStatistics('6358c9df6b855eaf3ddcc9d0')
        // this.getStorePositionMetrics(new Date(new Date().getTime() - 10 * 60 * 60 * 1000), new Date())
    }
    async getStorePickupPoint(storeId: string, displayName: string) {
        return this.kaspiStorePickupPointModel.findOne({ storeId, displayName })
    }

    public async getStorePositionMetrics(startDate: Date, endDate: Date) {
        const maxTimeInterval = 24 * 60 * 60 * 1000
        const currentDate = new Date()

        if (currentDate < endDate) {
            endDate = currentDate
        }

        if (endDate.getTime() - startDate.getTime() > maxTimeInterval) {
            startDate = new Date(endDate.getTime() - maxTimeInterval)
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
        ])

        return metrics
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
            })

        for (let store of stores) {
            try {
                const kaspiSettings = await this.kaspiService.getSettings(store.login, store.password, store.storeId)

                if (kaspiSettings.isAuthorized) {
                    console.log(kaspiSettings)

                    await this.storeModel.updateOne(
                        {
                            _id: store._id,
                        },
                        {
                            cookie: kaspiSettings.cookie,
                            name: kaspiSettings.name,
                            storeId: kaspiSettings.storeId,
                            url: kaspiSettings.url,
                            logo: kaspiSettings.logo,
                            isBadCredentials: false,
                            unauthDate: null,
                        }
                    )
                }
            } catch (e) {
                console.log('[^]' + ' store.sarvice updateStoresData' + ' | ' + new Date() + ' | ' + '\n'+e);
            }
        }

        // console.log(stores.length)
    }

    async getRandomStore() {
        const stores = await this.storeModel.find({
            cookie: { $ne: '' },
            expireDate: { $gte: new Date() },
        })
        if (stores.length <= 0) {
            return null
        }

        return stores[parseInt(Math.random() * stores.length + '')]
    }

    async getAllStores() {
        return this.storeModel.find({})
    }

    async getMainCity(storeId: string) {
        return this.storeModel.findOne({ _id: storeId }).select({ mainCity: 1 })
    }

    async getActiveStores() {
        return this.storeModel.find({
            expireDate: {
                $gte: new Date(),
            },
        })
    }

    async updateStoreTaxRegime(storeId: string, taxRegime: number) {
        // Ensure you update the specific field in your DB
        const store = await this.storeModel.findByIdAndUpdate(
            storeId,
            { $set: { taxRegime: taxRegime } }, // Use $set to update only this field
            { new: true } // Return the updated document
        );

        if (!store) {
            throw new NotFoundException('Store not found');
        }

        return store;
    }

    public async getActiveStoresPaymentData() {
        let sumNotOverdue = 0

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
        ])
        let amountNotOverdue = stores.length
        for (const store of stores) {
            for (const payment of store.result) {
                if (!payment.numberOfMonth || payment.number === 0) {
                    sumNotOverdue += payment.price
                    continue
                }
                sumNotOverdue += payment.price / Math.ceil(payment.numberOfMonth)
            }
        }
        // console.log(Math.ceil(sumNotOverdue));
        // console.log(amountNotOverdue);

        return {
            sumNotOverdue: Math.ceil(sumNotOverdue),
            notOverdue: amountNotOverdue,
        }
    }

    async launchCrons() {
        try {

            // new CronJob('*/15 * * * *', async () => {
            //     const stores = await this.storeModel.find({
            //         expireDate: {
            //             $gte: new Date(),
            //         },
            //     })
            //     console.log(`FOUND ${stores.length} STORES TO UPDATE CALCULATE CABINET STATISTICS | ${new Date()}`)

            //     for (let store of stores) {
            //         await this.calculateCabinetStatistics(store._id.toString())
            //     }
            // }).start()

            new CronJob('0 0 * * *', async () => {
                await this.storeFinishModel.deleteMany({})
            }).start()
        } catch (e) {
            console.log('[^]' + ' store.sarvice  launchCrons' + ' | ' + new Date() + ' | ' + '\n' + e)
        }
    }

    

    async getStoresByUserIdForClient(userId: string) {
        if (!isValidObjectId(userId)) {
            return []
        }

        const WHATSAPP_FEATURE_ID = new Types.ObjectId('66a9d64d68beee720bc1f3d0')

        const stores = await this.storeModel.aggregate([
            {
                $match: {
                    userId: new Types.ObjectId(userId),
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
        ])

        return stores
    }

    async getStoresByUserId(userId: string) {
        const result = []

        await this.storeModel.deleteOne({
            userId,
            name: '',
        })

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
        })

        for (const store of stores) {
            result.push({
                store,
                marketplace: await this.marketplaceService.getMarketplace(store.marketplaceId.toString()),
            })
        }

        return result
    }

    async getStoreByUserId(userId: string, storeId: string) {
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
        })

        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const marketplace = await this.marketplaceService.getMarketplace(store.marketplaceId.toString())

        return {
            store,
            marketplace,
            cities: await this.marketplaceCityModel.find().select({ id: 1, name: 1 }),
            storeCities: await this.storeCityService.getStoreCities(store._id.toString()),
        }
    }

    async getByMerchantId(merchantId: string) {
        return this.storeModel.findOne({
            storeId: merchantId,
        })
    }

    async getStoreByIdForClient(id: string) {
        let _id: Types.ObjectId
        try {
            _id = new Types.ObjectId(id)
        } catch (e) {
            console.log('[^]' + ' store.sarvice getStoreByIdForClient' + ' | ' + new Date() + ' | ' + '\n' + e)
        }

        if (!_id) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
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
                                featureId: new Types.ObjectId('66a9d64d68beee720bc1f3d0'),
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
                    // 'isTest',
                    'isProcessing',
                    'changePriceMethod',
                    'isAutoUploadXml',
                    'requestType',
                    'privilege',
                    'techData',
                ],
            },
            ...this.getPrivilegedStoreQuery(),
        ])

        if (store.length === 0) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        return store[0]
    }

    private getPrivilegedStoreQuery() {
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
        ]
    }

    async getStoreById(id: string) {
        let _id: Types.ObjectId
        try {
            _id = new Types.ObjectId(id)
        } catch (e) {
            console.log('[^]' + ' store.sarvice getStoreById' + ' | ' + new Date() + ' | ' + '\n' + e)
        }

        if (!_id) {
            return null
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
        })
    }

    async createStore(dto: CreateStoreDto, userId: string) {
        // console.log(`createStore:`, dto)

        const user = await this.userService.findUserById(userId)
        const countStores = await this.storeModel.count({ userId })

        if (!user) {
            throw new UnauthorizedException('Пользователь не найден')
        }

        const marketplace = await this.marketplaceService.getMarketplace(dto.marketplaceId)
        if (!marketplace) {
            throw new NotFoundException(MARKETPLACE_NOT_FOUND_ERROR)
        }

        let foundStore = await this.storeModel.findOne({
            login: dto.login,
            marketplaceId: dto.marketplaceId,
        })
        let foundUser = null
        if (foundStore) {
            foundUser = await this.userService.findUserById(foundStore.userId.toString())

            throw new BadRequestException({
                login: foundStore.login,
                phone: foundUser.email,
                message: STORE_ALREADY_EXISTS_ERROR,
            })
        }

        if (countStores >= user.storeLimit) {
            console.log(countStores, user.storeLimit)

            throw new BadRequestException(MAX_STORE_ERROR)
        }

       

        let kaspiSettings: KaspiSettingsDto

        kaspiSettings = await this.kaspiService.checkKaspiCredentials(dto.login, dto.password)
        if (!kaspiSettings.isAuthorized) {
            throw new BadRequestException(KASPI_BAD_CREDENTIALS_ERROR)
        }

        let newStore: StoreModel
        try {
            const storeData: any = {
                userId: user._id,
                login: dto.login,
                password: dto.password,
                marketplaceId: marketplace._id,
                maxDempingProducts: 99999,
                requestType: 'NEW',
                isTest: countStores === 0,
            }

            // Добавляем expireDate только для первого магазина
            if (countStores === 0) {
                storeData.expireDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 3)
            } else {
                storeData.expireDate = new Date()
            }

            newStore = await new this.storeModel(storeData).save()

         

            await this.userService.updateIsRef(user._id.toString(), false)

            if (kaspiSettings.isAuthorized) {
                foundStore = await this.storeModel.findOne({
                    url: kaspiSettings.url,
                })

                if (foundStore) {
                    foundUser = await this.userService.findUserById(foundStore.userId.toString())

                    kaspiSettings.isAuthorized = false

                    throw new BadRequestException({
                        login: foundStore.login,
                        phone: foundUser.email,
                        message: STORE_ALREADY_EXISTS_ERROR,
                    })
                }

                await this.storeModel.updateOne(
                    {
                        _id: newStore._id,
                    },
                    {
                        login: dto.login,
                        password: dto.password,
                        name: kaspiSettings.name,
                        url: kaspiSettings.url,
                        logo: kaspiSettings.logo,
                        cookie: kaspiSettings.cookie,
                        storeId: kaspiSettings.storeId,
                    }
                )

                await this.userService.testUsed(userId)

                const store = await this.storeModel.findOne({ _id: newStore._id })

                

                let isLeadUpdated = false

               

                // this.storeWaService.afterStoreAdd(newStore.userId, newStore._id, user.email)

                this.kaspiService.checkApiToken(kaspiSettings.cookie, newStore._id.toString())

                new this.productLoadQueue({
                    storeId: store._id,
                }).save()

                const jobOptions: JobOptions = {
                    removeOnComplete: true,
                    removeOnFail: true,
                    priority: 1,
                }

                this.getKaspiStoreApiTokenQueue
                    .add(
                        {
                            storeId: store._id.toString(),
                        },
                        jobOptions
                    )
                    .catch((err) => {
                        console.log('[^]' + ' store.sarvice getKaspiStoreApiTokenQueue' + ' | ' + new Date() + ' | ' + '\n' + err)
                    })

                this.actualizeKaspiStoreCitiesQueue
                    .add(
                        {
                            storeId: store._id.toString(),
                        },
                        jobOptions
                    )
                    .catch((e) => {
                        console.log('[^]' + ' store.sarvice actualizeKaspiStoreCitiesQueue' + ' | ' + new Date() + ' | ' + '\n' + e)
                    })
                    jobOptions.jobId = store._id.toString()
                this.actualizeKaspiStorePickupPointsQueue
                    .add(
                        {
                            storeId: store._id.toString(),
                        },
                        jobOptions
                    )
                    .catch((err) => {
                        console.log('[^]' + ' store.sarvice actualizeKaspiStorePickupPointsQueue' + ' | ' + new Date() + ' | ' + '\n' + err)
                    })

                return store
            } else {
                if (newStore?._id) {
                    await this.storeModel.deleteOne({ _id: newStore._id })
                }
                throw new BadRequestException(KASPI_BAD_CREDENTIALS_ERROR)
            }
        } catch (e) {
            await this.storeModel.deleteOne({ _id: newStore._id })
            console.log('[^]' + ' store.sarvice createStore' + ' | ' + new Date() + ' | ' + '\n' + e)

            throw e
        } finally {
            if (!kaspiSettings?.isAuthorized) {
                await this.storeModel.deleteOne({ _id: newStore._id })
            }
        }
    }

    async createTestStore(userId: string) {
        const user = await this.userService.findUserById(userId)
        if (!user) {
            throw new UnauthorizedException('Пользователь не найден')
        }

        const existingStore = await this.storeModel.findOne({ userId })
        if (existingStore) {
            throw new BadRequestException('У вас уже есть магазин. Удалите его перед созданием нового тестового.')
        }

        const marketplaceId = new Types.ObjectId()
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
        }).save()

        const products = [
            { sku: 'DEMO-001', name: 'Samsung Galaxy S24 Ultra 256GB', price: 549990, brand: 'Samsung', category: 'Смартфоны', isDemping: true, isActive: true, amount: 15, place: 1, purchasePrice: 450000 },
            { sku: 'DEMO-002', name: 'Apple iPhone 15 Pro Max 256GB', price: 699990, brand: 'Apple', category: 'Смартфоны', isDemping: false, isActive: true, amount: 8, place: 3, purchasePrice: 600000 },
            { sku: 'DEMO-003', name: 'Xiaomi 14 Ultra 512GB', price: 399990, brand: 'Xiaomi', category: 'Смартфоны', isDemping: true, isActive: true, amount: 25, place: 2, purchasePrice: 320000 },
            { sku: 'DEMO-004', name: 'Sony WH-1000XM5 Наушники', price: 149990, brand: 'Sony', category: 'Наушники', isDemping: false, isActive: true, amount: 30, place: 1, purchasePrice: 110000 },
            { sku: 'DEMO-005', name: 'MacBook Air M3 15 256GB', price: 599990, brand: 'Apple', category: 'Ноутбуки', isDemping: false, isActive: false, amount: 0, place: 5, purchasePrice: 500000 },
            { sku: 'DEMO-006', name: 'Samsung Galaxy Watch 6 Classic', price: 179990, brand: 'Samsung', category: 'Умные часы', isDemping: true, isActive: true, amount: 12, place: 1, purchasePrice: 140000 },
            { sku: 'DEMO-007', name: 'Apple AirPods Pro 2', price: 119990, brand: 'Apple', category: 'Наушники', isDemping: true, isActive: true, amount: 40, place: 2, purchasePrice: 90000 },
            { sku: 'DEMO-008', name: 'Dyson V15 Detect', price: 349990, brand: 'Dyson', category: 'Пылесосы', isDemping: false, isActive: true, amount: 5, place: 4, purchasePrice: 280000 },
        ]

        const ProductModel = this.productService['productModel']
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
            }).save()
        }

        return {
            message: 'Тестовый магазин создан',
            storeId: newStore._id,
            storeName: newStore.name,
            productsCount: products.length,
        }
    }

    async sendStorePinCode(storeId: string) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }
        const store = await this.storeModel.findOne({ _id: storeId })
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        if (!store.phone) {
            throw new BadRequestException('Магазин авторизован не по номеру телефона')
        }

        // ✅ ЗАЩИТА ОТ ПОВТОРНЫХ ВЫЗОВОВ: блокируем отправку SMS на 60 секунд (атомарно)
        const lockKey = `sms_send_lock:${store.phone}`
        
        // ✅ Используем SETNX для атомарной установки блокировки (предотвращает race condition)
        const lockAcquired = await this.redisClient.setNX(lockKey, '1')
        
        if (!lockAcquired) {
            throw new BadRequestException('Код уже отправлен. Пожалуйста, подождите 60 секунд перед повторной отправкой.')
        }

        // Устанавливаем TTL на 60 секунд
        await this.redisClient.expire(lockKey, 60)

        try {
            const response = await this.kaspiService.sendPinCode(store.phone)

        if (response.isError) {
            throw new InternalServerErrorException('Что-то пошло не так')
        }

            if (response.statusCode === 200 && response.cookie && response.userAgent) {
                await this.storeModel.updateOne(
                    {
                        _id: store._id,
                    },
                    {
                        cookie: response.cookie,
                        userAgent: response.userAgent,
                    }
                )

                return
            }

            // console.log(response)

            throw new InternalServerErrorException('Что-то пошло не так')
        } catch (error) {
            // При ошибке снимаем блокировку, чтобы можно было попробовать снова
            await this.redisClient.del(lockKey)
            throw error
        }
    }

    async createStorePhone(dto: CreateStorePhoneDto, userId: string) {
        const startTime = Date.now()
        dto.phone = dto.phone.replace(/[^+\d]/g, '')

        // Параллельное выполнение проверок для оптимизации
        const [user, countStores, marketplace, foundStore] = await Promise.all([
            this.userService.findUserById(userId),
            this.storeModel.countDocuments({ userId }),
            this.marketplaceService.getMarketplace(dto.marketplaceId),
            this.storeModel.findOne({
                phone: dto.phone,
                marketplaceId: dto.marketplaceId,
            }).select('_id').lean(),
        ])

        if (!user) {
            throw new UnauthorizedException()
        }

        if (countStores >= user.storeLimit) {
            throw new BadRequestException(MAX_STORE_ERROR)
        }

        if (!marketplace) {
            throw new NotFoundException(MARKETPLACE_NOT_FOUND_ERROR)
        }

        if (foundStore) {
            throw new BadRequestException(STORE_ALREADY_EXISTS_ERROR)
        }

        if (marketplace.name !== 'Kaspi') {
            throw new BadRequestException()
        }

        // ✅ ЗАЩИТА ОТ ПОВТОРНЫХ ВЫЗОВОВ: блокируем отправку SMS на 60 секунд (атомарно)
        const lockKey = `sms_send_lock:${dto.phone}`
        
        // ✅ Используем SETNX для атомарной установки блокировки (предотвращает race condition)
        const lockAcquired = await this.redisClient.setNX(lockKey, '1')
        
        if (!lockAcquired) {
            throw new BadRequestException('Код уже отправлен. Пожалуйста, подождите 60 секунд перед повторной отправкой.')
        }

        // Устанавливаем TTL на 60 секунд
        await this.redisClient.expire(lockKey, 60)

        try {
            const kaspiRequest = await this.kaspiService.sendPinCode(dto.phone)
        
            metrics.histogram('store-registration-create-store-phone-duration', Date.now() - startTime, [
                `isError:${kaspiRequest.isError}`,
                `statusCode:${kaspiRequest.statusCode}`,
            ])
            
            if (kaspiRequest.isError) {
                throw new InternalServerErrorException('Не удалось отправить код на ваш телефон, пожалуйста попробуйте еще раз');
            }
            
            const payload: KaspiTmpPayload = { 
                cookie: kaspiRequest.cookie,
                userAgent: kaspiRequest.userAgent,
                phone: dto.phone,
                marketplaceId: dto.marketplaceId,
                sessionId: (kaspiRequest as any).sessionId || '', // sessionId для использования сохраненного клиента (как на проде)
            };
            const token = createKaspiToken(payload, userId, 5 * 60 * 1000);

            return { token, ttlMs: 5 * 60 * 1000 };
        } catch (error) {
            // При ошибке снимаем блокировку, чтобы можно было попробовать снова
            await this.redisClient.del(lockKey)
            throw error
        }
    }

    async sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    async reAuthStoreByPhone(dto: ReAuthStoreByPhone) {
        dto.phone = dto.phone.replace(/[^+\d]/g, '')

        if (!isValidObjectId(dto.storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        let store = await this.storeModel.findOne({ _id: dto.storeId })
        if (!store) throw new NotFoundException(STORE_NOT_FOUND_ERROR)

        const kaspiRequest = await this.kaspiService.sendPinCode(dto.phone)

        metrics.histogram('kaspi-store-reauth-store-by-phone', 1, [
            `isError:${kaspiRequest.isError}`,
            `response:${kaspiRequest.statusCode}`,
            `store:${store.name}-${store._id}`,
        ])

        if (kaspiRequest.isError) {
            throw new InternalServerErrorException('Не удалось отправить код на ваш телефон, пожалуйста попробуйте еще раз');
        }

        const payload: KaspiTmpPayload = {
            cookie: kaspiRequest.cookie,
            userAgent: kaspiRequest.userAgent,
            phone: dto.phone,
            marketplaceId: store.marketplaceId.toString(),
            sessionId: kaspiRequest.sessionId
        };

        const token = createKaspiToken(payload, store.userId.toString(), 5 * 60 * 1000);

        return { token, ttlMs: 5 * 60 * 1000 };
    }

    async reVerifyPhoneNumber(dto: VerifyExistingStorePhoneDto) {
        if (!isValidObjectId(dto.storeId)) throw new NotFoundException(STORE_NOT_FOUND_ERROR)

        let store = await this.storeModel.findOne({ _id: dto.storeId })
        if (!store) throw new NotFoundException(STORE_NOT_FOUND_ERROR)

        const tmp = verifyKaspiToken<KaspiTmpPayload & { sub: string }>(dto.token, store.userId.toString());
        if (!tmp) {
            throw new BadRequestException('Сессия верификации не найдена или истекла. Пожалуйста, начните заново.');
        }

        const result = await this.kaspiService.verifyStorePhone(
            dto.pin,
            tmp.cookie,
            tmp.userAgent,
            tmp.sessionId
        )

        metrics.histogram('kaspi-store-reverify-phone-number', 1, [
            `isError:${result.isError}`,
            `response:${result.statusCode}`,
            `store:${store.name}-${store._id}`,
        ])

        if (!result?.isError && result.statusCode === 200) {
            await this.storeModel.updateOne({ _id: store._id }, { cookie: result.cookie, isBadCredentials: false });
            return { ok: true };
        }

        if (result.statusCode === 401) {
            throw new BadRequestException('Магазин по данному номеру не зарегистрирован в Kaspi, пожалуйста пройдите регистрацию в Kaspi')
        }

        throw new BadRequestException('Неправильный SMS код')
    }

    async verifyPhoneNumber(dto: VerifyNewStorePhoneDto, userId: string) {
        // КРИТИЧЕСКИЙ ЛОГ - должен быть виден всегда
        console.log('[^]' + ' store.service verifyPhoneNumber START' + ' | ' + new Date() + ' | ' + `userId: ${userId}`)
        console.log('[^]' + ' store.service verifyPhoneNumber START' + ' | ' + new Date() + ' | ' + `userId: ${userId}, token: ${dto.token ? 'есть' : 'нет'}, pin: ${dto.pin ? 'есть' : 'нет'}`)
        const startTime = Date.now()
        const tmp = verifyKaspiToken<KaspiTmpPayload & { sub: string }>(dto.token, userId);
        console.log('tmp', tmp)
        if (!tmp) {
            console.log('[^]' + ' store.service verifyPhoneNumber NO_SESSION' + ' | ' + new Date() + ' | ' + `userId: ${userId}`)
            throw new BadRequestException('Сессия верификации не найдена или истекла. Пожалуйста, начните заново.');
        }
        console.log('[^]' + ' store.service verifyPhoneNumber SESSION_FOUND' + ' | ' + new Date() + ' | ' + `userId: ${userId}, cookie: ${tmp.cookie ? 'есть' : 'нет'}, userAgent: ${tmp.userAgent ? 'есть' : 'нет'}`)

        // Параллельное выполнение проверок пользователя и количества магазинов
        const [user, countStores] = await Promise.all([
            this.userService.findUserById(userId),
            this.storeModel.countDocuments({ userId }),
        ]);

        if (!user) {
            throw new NotFoundException(USER_NOT_FOUND_ERROR);
        }
        
        if (countStores >= user.storeLimit) {
            throw new BadRequestException(MAX_STORE_ERROR)
        }

        console.log('[^]' + ' store.service verifyPhoneNumber BEFORE_VERIFY_STORE_PHONE' + ' | ' + new Date() + ' | ' + 
            `userId: ${userId}, pin length: ${dto.pin?.length || 0}, cookie length: ${tmp.cookie?.length || 0}, userAgent length: ${tmp.userAgent?.length || 0}, sessionId: ${tmp.sessionId ? 'есть' : 'нет'}`)
        
        let result
        try {
            result = await this.kaspiService.verifyStorePhone(
                dto.pin,
                tmp.cookie,
                tmp.userAgent,
                tmp.sessionId // Передаем sessionId для использования сохраненного клиента (как на проде)
            )
        } catch (error: any) {
            console.error('[^]' + ' store.service verifyPhoneNumber VERIFY_STORE_PHONE_ERROR' + ' | ' + new Date() + ' | ' + 
                `userId: ${userId}, error: ${error?.message || 'unknown'}, stack: ${error?.stack?.substring(0, 200) || 'нет'}`)
            throw error
        }
        
        console.log('[^]' + ' store.service verifyPhoneNumber VERIFY_STORE_PHONE_RESULT' + ' | ' + new Date() + ' | ' + 
            `userId: ${userId}, statusCode: ${result?.statusCode}, isError: ${result?.isError}, hasCookie: ${!!(result?.cookie && result.cookie.length > 0)}, cookieLength: ${result?.cookie?.length || 0}, hasStoreId: ${!!(result?.storeId && result.storeId.length > 0)}, storeId: ${result?.storeId || 'нет'}`)
        
        metrics.histogram('store-registration-verify-phone-duration', Date.now() - startTime, [
            `isError:${result.isError}`,
            `statusCode:${result.statusCode}`,
        ])
        
        if (result?.statusCode === 401) {
            console.error('[^]' + ' store.service verifyPhoneNumber ERROR_401' + ' | ' + new Date() + ' | ' + `userId: ${userId}, storeId: ${result?.storeId || 'нет'}`)
            throw new BadRequestException('Магазин по данному номеру не зарегистрирован в Kaspi, пожалуйста пройдите регистрацию в Kaspi');
        }
        if (result?.isError || result?.statusCode !== 200) {
            console.error('[^]' + ' store.service verifyPhoneNumber VERIFY_ERROR' + ' | ' + new Date() + ' | ' + 
                `userId: ${userId}, statusCode: ${result.statusCode}, isError: ${result.isError}`)
            throw new BadRequestException('Неправильный SMS код');
        }
        
        console.log('[^]' + ' store.service verifyPhoneNumber VERIFY_SUCCESS' + ' | ' + new Date() + ' | ' + 
            `userId: ${userId}, storeId: ${result.storeId}`)
        

        // Получаем данные магазина
        console.log('[^]' + ' store.service verifyPhoneNumber BEFORE_GET_STORE_DATA' + ' | ' + new Date() + ' | ' + 
            `userId: ${userId}, cookie length: ${result.cookie?.length || 0}, userAgent length: ${result.userAgent?.length || 0}, storeId: ${result.storeId || 'нет'}`)
        
        let storeData
        try {
            storeData = await this.kaspiService.getStoreData(result.cookie, result.userAgent || '', result.storeId)
        } catch (error: any) {
            console.error('[^]' + ' store.service verifyPhoneNumber GET_STORE_DATA_ERROR' + ' | ' + new Date() + ' | ' + 
                `userId: ${userId}, error: ${error?.message || 'unknown'}, stack: ${error?.stack?.substring(0, 200) || 'нет'}`)
            throw error
        }
        
        console.log('[^]' + ' store.service verifyPhoneNumber GET_STORE_DATA_RESULT' + ' | ' + new Date() + ' | ' + 
            `userId: ${userId}, hasStoreData: ${!!storeData}, storeId: ${storeData?.storeId || 'нет'}, isAuthorized: ${storeData?.isAuthorized || false}`)
        console.log(`[STORE_SERVICE] 📥 Данные магазина получены:`, {
            isAuthorized: storeData?.isAuthorized,
            hasStoreId: !!(storeData?.storeId && storeData.storeId.length > 0),
            storeId: storeData?.storeId,
            name: storeData?.name
        })

        if (!storeData.isAuthorized) {
            throw new BadRequestException('Не удалось авторизоваться в Kaspi, попробуйте заново.');
        }

        // Проверяем дубликаты после получения данных магазина
        const duplicate = await this.storeModel.findOne({ 
            $or: [{ url: storeData.url }, { storeId: storeData.storeId }] 
        }).select('_id').lean();

        if (duplicate) {
            throw new BadRequestException(STORE_ALREADY_EXISTS_ERROR);
        }

        console.log(`[STORE_SERVICE] 💾 Создаем новый Store в базе...`)
        const newStore = await new this.storeModel({
            marketplaceId: new Types.ObjectId(tmp.marketplaceId),
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
        console.log('[^]' + ' store.service verifyPhoneNumber STORE_CREATED' + ' | ' + new Date() + ' | ' + `storeId: ${newStore._id}, name: ${newStore.name}, kaspiStoreId: ${newStore.storeId}`)

        // Неблокирующие операции - не ждем ответа, просто запускаем асинхронно
       

        // Остальные фоновые задачи
       

        // Создание пользователя в Kaspi кабинете ПОСЛЕ сохранения магазина (используем cookies из верификации)
        // Используем result.cookie - свежие cookies из успешной верификации, как на проде
        // Вызываем createKaspiUser неблокирующе с реальным storeId (магазин уже создан)
        
        console.log('[^]' + ' store.service verifyPhoneNumber BEFORE_CREATE_USER_CHECK' + ' | ' + new Date() + ' | ' + 
            `storeId: ${newStore._id}, result.cookie exists: ${!!result?.cookie}, tmp.userAgent exists: ${!!tmp?.userAgent}, storeData.storeId exists: ${!!storeData?.storeId}`)
        
        // Используем userAgent из result (из ответа auth-api) или tmp.userAgent (из сессии)
        // result.userAgent - это userAgent, который вернул auth-api после верификации (более актуальный)
        const resultUserAgent = (result as any).userAgent || tmp.userAgent
        
        const hasResultCookie = !!(result?.cookie && result.cookie.length > 0)
        const hasUserAgent = !!(resultUserAgent && resultUserAgent.length > 0)
        const hasStoreDataStoreId = !!(storeData?.storeId && storeData.storeId.length > 0)
        
        console.log('[^]' + ' store.service verifyPhoneNumber CHECK_CONDITIONS' + ' | ' + new Date() + ' | ' + 
            `storeId: ${newStore._id}, hasCookie: ${hasResultCookie}, hasUserAgent: ${hasUserAgent}, hasKaspiStoreId: ${hasStoreDataStoreId}`)
        console.log('[^]' + ' store.service verifyPhoneNumber CHECK_CONDITIONS_DETAILS' + ' | ' + new Date() + ' | ' + 
            `result.cookie length: ${result?.cookie?.length || 0}, result.userAgent: ${(result as any).userAgent ? 'есть' : 'нет'}, tmp.userAgent length: ${tmp?.userAgent?.length || 0}, storeData.storeId: ${storeData?.storeId || 'нет'}`)
        
        // Вызываем createKaspiUser только если есть все необходимые данные
        if (!result.cookie || result.cookie.length === 0) {
            console.log('[^]' + ' store.service verifyPhoneNumber SKIP_NO_COOKIE' + ' | ' + new Date() + ' | ' + `storeId: ${newStore._id}, result.cookie: ${result.cookie}`)
        } else if (!resultUserAgent || resultUserAgent.length === 0) {
            console.log('[^]' + ' store.service verifyPhoneNumber SKIP_NO_USERAGENT' + ' | ' + new Date() + ' | ' + `storeId: ${newStore._id}, resultUserAgent: ${resultUserAgent}`)
        } else if (!storeData.storeId || storeData.storeId.length === 0) {
            console.log('[^]' + ' store.service verifyPhoneNumber SKIP_NO_KASPISTOREID' + ' | ' + new Date() + ' | ' + `storeId: ${newStore._id}, storeData.storeId: ${storeData.storeId}`)
        } else {
            console.log('[^]' + ' store.service verifyPhoneNumber ALL_CONDITIONS_MET' + ' | ' + new Date() + ' | ' + 
                `storeId: ${newStore._id}, kaspiStoreId: ${storeData.storeId}, cookieLength: ${result.cookie?.length || 0}, userAgentLength: ${resultUserAgent?.length || 0}`)
            console.log('[^]' + ' store.service verifyPhoneNumber CALLING_CREATE_USER' + ' | ' + new Date() + ' | ' + 
                `storeId: ${newStore._id}, kaspiStoreId: ${storeData.storeId}`)
            
            try {
                // Используем cookies из result.cookie (свежие после верификации)
                // Используем userAgent из result (из ответа auth-api) или tmp.userAgent (из сессии)
                const cookieToUse = result.cookie
                const userAgentToUse = resultUserAgent
                
                console.log('[^]' + ' store.service verifyPhoneNumber CREATE_USER_PARAMS' + ' | ' + new Date() + ' | ' + 
                    `storeId: ${newStore._id}, kaspiStoreId: ${storeData.storeId}, cookieSource: ${result.cookie ? 'result' : storeData.cookie ? 'storeData' : 'newStore'}, cookieLength: ${cookieToUse?.length || 0}, userAgentLength: ${userAgentToUse?.length || 0}`)
                
                const createUserPromise = this.kaspiService.createKaspiUser({
                    storeId: newStore._id.toString(),
                    kaspiStoreId: storeData.storeId,
                    cookie: cookieToUse, // Используем cookies из верификации (как на проде)
                    userAgent: userAgentToUse,
                })
                
                console.log('[^]' + ' store.service verifyPhoneNumber CREATE_USER_PROMISE_CREATED' + ' | ' + new Date() + ' | ' + `storeId: ${newStore._id}`)
                
                createUserPromise.then((createUserResult) => {
                console.log('[^]' + ' store.service verifyPhoneNumber CREATE_USER_RESULT' + ' | ' + new Date() + ' | ' + 
                    `storeId: ${newStore._id}, success: ${createUserResult.success}, hasEmail: ${!!createUserResult.email}, hasPassword: ${!!createUserResult.password}, error: ${createUserResult.error || 'нет'}`)
                
                // Обновляем Store ТОЛЬКО если пользователь успешно создан в Kaspi
                // Если success === false, то email может быть создан, но пользователь не создан в Kaspi - такой email бесполезен
                if (createUserResult.success && createUserResult.email) {
                    // Сохраняем логин (email) в Store сразу после создания пользователя в Kaspi
                    // Пароль будет получен в фоне через auth-api и обновлен через retry механизм
                    // login будет использоваться для авторизации в Kaspi кабинете
                    return this.storeModel.updateOne(
                        { _id: newStore._id },
                        {
                            $set: {
                                login: createUserResult.email, // Email пользователя = login для Store
                                // password будет обновлен позже в фоне через retry механизм в auth-api
                            },
                        }
                    ).then(() => {
                        console.log('[^]' + ' store.service verifyPhoneNumber STORE_UPDATED_WITH_EMAIL' + ' | ' + new Date() + ' | ' + 
                            `storeId: ${newStore._id}, email: ${createUserResult.email}, password: будет обновлен в фоне`)
                        
                        // Если пароль уже есть в ответе (редкий случай быстрого получения), обновляем его тоже
                        if (createUserResult.password) {
                            return this.storeModel.updateOne(
                                { _id: newStore._id },
                                {
                                    $set: {
                                        password: createUserResult.password,
                                    },
                                }
                            ).then(() => {
                                console.log('[^]' + ' store.service verifyPhoneNumber STORE_UPDATED_WITH_PASSWORD' + ' | ' + new Date() + ' | ' + 
                                    `storeId: ${newStore._id}, password: получен сразу`)
                            })
                        } else {
                            console.log('[^]' + ' store.service verifyPhoneNumber PASSWORD_WILL_BE_UPDATED_IN_BACKGROUND' + ' | ' + new Date() + ' | ' + 
                                `storeId: ${newStore._id}, password: будет получен в фоне через auth-api`)
                        }
                    });
                } else {
                    // Пользователь НЕ создан в Kaspi - не обновляем Store
                    // Если email был создан, но пользователь не создан - email бесполезен
                    console.error('[^]' + ' store.service verifyPhoneNumber CREATE_USER_FAILED_STORE_NOT_UPDATED' + ' | ' + new Date() + ' | ' + 
                        `storeId: ${newStore._id}, success: ${createUserResult.success}, hasEmail: ${!!createUserResult.email}, error: ${createUserResult.error || 'unknown'}`)
                    console.error('[^]' + ' store.service verifyPhoneNumber REASON' + ' | ' + new Date() + ' | ' + 
                        `Store НЕ обновлен, т.к. пользователь не создан в Kaspi. Email (если был создан) не будет сохранен, т.к. он бесполезен без пользователя в Kaspi.`)
                }
            }).catch((error) => {
                // Логируем ошибку, но не блокируем процесс регистрации
                console.error('[^]' + ' store.service verifyPhoneNumber CREATE_USER_ERROR' + ' | ' + new Date() + ' | ' + 
                    `storeId: ${newStore._id}, error: ${error?.message || 'unknown'}`)
                if (error?.message) {
                    console.error('[STORE_SERVICE] Error message:', error.message);
                }
                if (error?.response) {
                    console.error('[STORE_SERVICE] Error response:', error.response.status, error.response.data);
                }
                if (error?.stack) {
                    console.error('[STORE_SERVICE] Error stack:', error.stack.substring(0, 300));
                }
                });
            } catch (error: any) {
                // Логируем ошибку, если не удалось даже вызвать createKaspiUser
                console.error('[STORE_SERVICE] ❌ Failed to call createKaspiUser:', error);
                console.error('[STORE_SERVICE]    Error message:', error?.message);
                console.error('[STORE_SERVICE]    Error stack:', error?.stack?.substring(0, 300));
            }
        }

        metrics.histogram('store-registration-complete-duration', Date.now() - startTime, [
            `storeId:${newStore._id}`,
            `isTest:${newStore.isTest}`,
        ])

        console.log('[^]' + ' store.service verifyPhoneNumber SUCCESS' + ' | ' + new Date() + ' | ' + 
            `storeId: ${newStore._id}, duration: ${Date.now() - startTime}ms`)

        return {
            _id: newStore._id,
            userId: newStore.userId,
        }
    }

    async updateStoreData(storeId: string) {
        try {
            const store = await this.storeModel.findOne({ _id: storeId })
            if (!store) {
                throw new NotFoundException(STORE_NOT_FOUND_ERROR)
            }

            console.log(`UPDATING STORE DATA: ${store.name} | ${new Date()}`)

            if (!store.cookie) {
                throw new BadRequestException(KASPI_BAD_CREDENTIALS_ERROR)
            }

            const storeData = await this.kaspiService.getStoreData(store.cookie, '', store.storeId)

            if (storeData.isAuthorized && storeData.storeId) {
                await this.storeModel.updateOne(
                    {
                        _id: store._id,
                    },
                    {
                        name: storeData.name,
                        url: storeData.url,
                        logo: storeData.logo,
                        storeId: storeData.storeId,
                    }
                )
            } else if (!storeData.isAuthorized && !storeData.isError) {
                await this.storeModel.updateOne(
                    {
                        _id: store._id,
                    },
                    {
                        isBadCredentials: true,
                        unauthDate: store.unauthDate || new Date(),
                    }
                )
            } else {
                throw new BadRequestException(KASPI_BAD_CREDENTIALS_ERROR)
            }
        } catch (e) {
            console.log('[^]' + ' store.sarvice updateStoreData' + ' | ' + new Date() + ' | ' + '\n' + e)
        }
    }

    async updateStoreName(storeId: string) {
        try {
            const store = await this.storeModel.findOne({ _id: storeId })
            if (!store) {
                throw new NotFoundException(STORE_NOT_FOUND_ERROR)
            }

            console.log(`UPDATING STORE DATA: ${store.name} | ${new Date()}`)

            if (!store.cookie) {
                throw new BadRequestException(KASPI_BAD_CREDENTIALS_ERROR)
            }

            const storeData = await this.kaspiService.getStoreData(store.cookie, '', store.storeId)

            if (storeData.isAuthorized && storeData.storeId) {
                await this.storeModel.updateOne(
                    {
                        _id: store._id,
                    },
                    {
                        name: storeData.name,
                        url: storeData.url,
                        logo: storeData.logo,
                        storeId: storeData.storeId,
                    }
                )
            } else if (!storeData.isAuthorized && !storeData.isError) {
                await this.storeModel.updateOne(
                    {
                        _id: store._id,
                    },
                    {
                        isBadCredentials: true,
                        unauthDate: store.unauthDate || new Date(),
                    }
                )
            } else {
                throw new BadRequestException(KASPI_BAD_CREDENTIALS_ERROR)
            }
        } catch (e) {
            console.log('[^]' + ' store.sarvice updateStoreName' + ' | ' + new Date() + ' | ' + '\n' + e)
        }
    }

    async deleteStore(storeId: string) {
        const foundStore = await this.storeModel.findOne({ _id: storeId })

        if (!foundStore) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        await this.storeModel.deleteOne({ _id: foundStore._id })
    }

    async updateStartOrStop(dto: StartStopStoreDto, storeId: string, userId: string) {
        const store = await this.storeModel.findOne({ _id: storeId, userId })

        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        await this.storeModel.updateOne(
            {
                _id: store._id,
            },
            {
                isStarted: dto.value,
            }
        )

        await new this.storeStateHistoryModel({
            storeId: store._id,
            isStarted: dto.value,
            author: 'USER',
            authorId: userId,
        }).save()
    }

    async getStoreStatistics(minusDay = 0) {
        let lteDate = new Date()
        if (minusDay !== 0) {
            lteDate = new Date(
                new Date(
                    Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - minusDay, 23, 59, 59, 999)
                ).getTime() -
                    6 * 60 * 60 * 1000
            )
        }

        let date = new Date(
            new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - minusDay)).getTime() -
                6 * 60 * 60 * 1000
        )

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
        }
    }

    async getStoreConversions(minusDay = 0) {
        let lteDate = new Date()
        if (minusDay !== 0) {
            lteDate = new Date(
                new Date(
                    Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - minusDay, 23, 59, 59, 999)
                ).getTime() -
                    6 * 60 * 60 * 1000
            )
        }

        let fromRegistrationToTestAll = '0'
        let fromRegistrationToTestToday = '0'
        let fromTestToPay = '0'
        let fromRegistrationToPay = '0'

        const allUsers = await this.userService.getAllUsers()
        const allTodayUsers = await this.userService.getAllTodayUsers()

        const allStores = await this.storeModel.count()
        const allTodayStores = await this.storeModel.count({
            createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - minusDay),
                $lte: lteDate,
            },
        })
        const allPaidStores = await this.storeModel.count({ isTest: false })

        const fromRegistrationToTestTodayCount = (allTodayStores / allTodayUsers.length) * 100

        fromRegistrationToTestAll = this.formatPercent((allStores / allUsers.length) * 100)
        fromRegistrationToTestToday = this.formatPercent(
            Number.isNaN(fromRegistrationToTestTodayCount) ? 0 : fromRegistrationToTestTodayCount
        )
        fromTestToPay = this.formatPercent((allPaidStores / allStores) * 100)
        fromRegistrationToPay = this.formatPercent((allPaidStores / allUsers.length) * 100)

        return {
            fromRegistrationToTestAll,
            fromRegistrationToTestToday,
            fromTestToPay,
            fromRegistrationToPay,
        }
    }

    private formatPercent(number: number) {
        return new Intl.NumberFormat('en-IN', {
            maximumSignificantDigits: 3,
        }).format(number)
    }

    async updateExpireDate(storeId: string, newDate: Date, maxDempProducts: number = null, marketplaceId: string) {
        await this.storeModel.updateOne(
            {
                _id: storeId,
            },
            {
                $set: {
                    expireDate: newDate,
                    isTest: false,
                    ...(maxDempProducts ? { maxDempingProducts: maxDempProducts } : {}),
                },
            }
        )
    }

    async searchStoresByKeyword(keyword: string) {
        const query = {
            $or: [
                {
                    name: {
                        $regex: keyword || '',
                        $options: 'i',
                    },
                },
            ],
        }

        const stores = await this.storeModel.find(query)

        const result = []

        for (let store of stores) {
            const marketplace = await this.marketplaceService.getMarketplace(store.marketplaceId.toString())

            const user = await this.userService.findUserById(store.userId.toString())

            result.push({
                marketplaceName: marketplace?.name || '',
                user: {
                    name: user?.name,
                    surname: user?.surname,
                    phone: user?.email,
                },
                name: store.name,
                expireDate: store.expireDate,
                isStarted: store.isStarted,
                _id: store._id,
                cityLimit: store.cityLimit,
            })
        }

        return result
    }

    async updateKaspiCredentials(userId: string, storeId: string, dto: UpdateStoreCredentialsDto) {
        const store = await this.getStoreById(storeId)
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        if (store.userId.toString() !== userId) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        if (!dto.login || !dto.password) {
            throw new BadRequestException(KASPI_BAD_CREDENTIALS_ERROR)
        }

      

        const kaspiSettings = await this.kaspiService.getSettings(dto.login, dto.password, store.storeId)

        if (kaspiSettings.isAuthorized) {
            await this.storeModel.updateOne(
                {
                    _id: storeId,
                },
                {
                    name: kaspiSettings.name,
                    logo: kaspiSettings.logo,
                    url: kaspiSettings.url,
                    login: dto.login,
                    password: dto.password,
                    isBadCredentials: false,
                    unauthDate: null,
                    cookie: kaspiSettings.cookie,
                    storeId: kaspiSettings.storeId,
                }
            )
            await this.actualizeStoreActiveProdutsHashQueue.add(
                {
                    storeId,
                },
                {
                    removeOnComplete: true,
                    priority: 1,
                    removeOnFail: true,
                    jobId: storeId
                }
            )
        } else {
            throw new BadRequestException(KASPI_BAD_CREDENTIALS_ERROR)
        }
    }

    async updateMainCity(userId: string, storeId: string, dto: UpdateDempingCityIdDto) {
        // console.log("UpdateMainCity.dto:", dto)
        const store = await this.storeModel.findOne({ _id: storeId, userId })
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        if (!dto.id) {
            throw new BadRequestException('ID города не найден')
        }

        const marketplace = await this.marketplaceService.getMarketplace(store.marketplaceId.toString())
        if (!marketplace) {
            throw new NotFoundException(MARKETPLACE_NOT_FOUND_ERROR)
        }

        const city = await this.cityService.getCity(marketplace.key, dto.id)
        if (!city) {
            throw new BadRequestException(INVALID_CITY_ID_ERROR)
        }

        const storeCity = await this.storeCityService.getStoreCity(store._id.toString(), dto.id)
        if (!storeCity) {
            throw new BadRequestException(SOMETHING_WENT_WRONG)
        }
        const mainCityDempingId = storeCity.dempingCityId
        storeCity.cityId = store.mainCity.id
        storeCity.dempingCityId = store.mainCity.dempingCityId
        storeCity.cityName = store.mainCity.name
        // console.log("UpdateMainCity: New StoreCity", storeCity)
        store.mainCity.id = city.id
        store.mainCity.name = city.name
        store.mainCity.dempingCityId = mainCityDempingId
        // console.log("UpdateMainCity: New mainCity", store.mainCity)
        await this.storeCityService.clearRedisStoresActiveProductsByCityId(store, dto.dempingCityId)

        await store.save()

        await storeCity.save()

        await this.redisClient.del(`storeCities:${storeId}`)

        return {
            store,
            storeCity,
        }
    }

    async updateMainCityData(userId: string, storeId: string, dto: UpdateDempingCityIdDto) {
        const store = await this.storeModel.findOne({ _id: storeId, userId })
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        if (!dto.id) {
            throw new BadRequestException('ID города не найден')
        }

        const marketplace = await this.marketplaceService.getMarketplace(store.marketplaceId.toString())
        if (!marketplace) {
            throw new NotFoundException(MARKETPLACE_NOT_FOUND_ERROR)
        }

        const city = await this.cityService.getCity(marketplace.key, dto.id)
        if (!city) {
            throw new BadRequestException(INVALID_CITY_ID_ERROR)
        }

        const storeCities = await this.storeCityService.getStoreCities(storeId)

        const found = await storeCities.filter((v) => v.cityId === city.id)

        if (found.length !== 0) {
            console.log(found)
            throw new BadRequestException(INVALID_CITY_ID_ERROR)
        }

        store.mainCity.id = city.id
        store.mainCity.name = city.name
        if (marketplace.name === 'Kaspi') store.mainCity.dempingCityId = dto.dempingCityId
        await this.storeCityService.clearRedisStoresActiveProductsByCityId(
            store,
            dto.dempingCityId
        )

        await store.save()

        await this.redisClient.del(`storeCities:${storeId}`)

        return {
            store,
        }
    }

    async updateDempingCityId(userId: string, storeId: string, dto: UpdateDempingCityIdDto) {
        const store = await this.storeModel.findOne({ _id: storeId, userId })
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        if (!dto.id) {
            throw new BadRequestException('ID города не найден')
        }

        const marketplace = await this.marketplaceService.getMarketplace(store.marketplaceId.toString())
        if (!marketplace) {
            throw new NotFoundException(MARKETPLACE_NOT_FOUND_ERROR)
        }

        const city = await this.cityService.getCity(marketplace.key, dto.id)
        if (!city) {
            throw new BadRequestException(INVALID_CITY_ID_ERROR)
        }

        // const dempingCityId = await this.cityService.getCity(marketplace.key, dto.dempingCityId)

        // if (!dempingCityId) {
        //     throw new BadRequestException(INVALID_CITY_ID_ERROR)
        // }

        const storeCity = await this.storeCityService.getStoreCity(store._id.toString(), dto.id)
        const mainCityDempingId = storeCity.dempingCityId
        storeCity.cityId = store.mainCity.id
        storeCity.dempingCityId = store.mainCity.dempingCityId
        storeCity.cityName = store.mainCity.name
        console.log('New StoreCity', storeCity)
        store.mainCity.id = city.id
        store.mainCity.name = city.name
        store.mainCity.dempingCityId = mainCityDempingId
        console.log('New mainCity', store.mainCity)

        // await store.save()

        // await this.actualizeProductMerchantsQueue
        //     .add(
        //         {
        //             storeId: store._id,
        //         },
        //         {
        //             removeOnComplete: true,
        //             removeOnFail: true,
        //             priority: 1,
        //         }
        //     )
        //     .catch((e) => {
        //         console.log('[^]' + ' store.sarvice ' + ' | ' + new Date() + ' | ' + '\n'+e);
        //     })

        return {
            cityId: dto.id,
            cityName: city.name,
        }
    }

    async isValidCityId(cityId: string) {
        const city = await this.marketplaceCityModel.findOne({ id: cityId })
        return !!city
    }

    async updateDempingOnlyThisCity(userId: string, storeId: string, dto: UpdateDempingCityOnlyDto) {
        const store = await this.storeModel.findOne({ _id: storeId, userId })
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        store.mainCity.isDempingOnlyThisCity = dto.isDempingOnlyThisCity

        await store.save()
    }

    async getCityById(id: string) {
        return this.marketplaceCityModel.findOne({ id: id })
    }

    async getCityIdByName(name: string) {
        return this.marketplaceCityModel.findOne({ name: name, marketplaceKey: 'KASPI' })
    }

    async updateCookie(storeId: string, cookie: string) {
        if (!cookie) {
            return
        }

        await this.storeModel.updateOne({ _id: storeId }, { cookie })
    }

    async giveNewCity(storeId: string) {
        const store = await this.storeModel.findOne({ _id: storeId })
        if (store) {
            const oldCityLimit = store.cityLimit

            await this.storeModel.updateOne(
                {
                    _id: storeId,
                },
                {
                    cityLimit: oldCityLimit + 1,
                }
            )
        }
    }

    async updateDempingPrice(storeId: string, dto: UpdateDempingPriceDto) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const store = await this.storeModel.findOne({ _id: storeId })
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        await this.storeModel.updateOne(
            {
                _id: storeId,
            },
            {
                dempingPrice: dto.dempingPrice,
            }
        )
    }

    async setIsBadCredentials(store: StoreModel, value: boolean) {
        if (value === true) {
            await this.storeModel.updateOne(
                {
                    _id: store._id,
                },
                {
                    isBadCredentials: value,
                    isSendPhoneAuthorizationMessage: false,
                    unauthDate: store.unauthDate || new Date(),
                }
            )
            
        } else {
            await this.storeModel
                .updateOne(
                    {
                        _id: store._id,
                    },
                    {
                        isBadCredentials: value,
                        unauthDate: null,
                    }
                )
                .catch((err) => {
                    console.log('[^]' + ' store.sarvice setIsBadCredentials' + ' | ' + new Date() + ' | ' + '\n' + err)
                })
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
        })
    }

    async calculateCabinetStatistics(storeId: string, startDateFromWeb?: Date, endDateFromWeb?: Date) {
        console.log('calculateCabinetStatistics', storeId)

        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }
        const store = await this.storeModel.findOne({ _id: storeId })
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const topSellingProducts = await this.orderService.getTopSellingProducts(storeId)
        // const topPoorlySellingProducts = await this.orderService.getTop5PoorlySellingProducts(storeId)
        // console.log(topPoorlySellingProducts)
        const topMarginProducts = await this.productService.getTopMarginProducts(storeId)
        const topLowMarginProducts = await this.productService.getTopLowMarginProducts(storeId)
        const topLowSellingCities = await this.orderService.getTop5LowSellingCities(storeId)
        const topSellingCities = await this.orderService.getTop5SellingCities(storeId)
        const topHighlyCompetitiveProducts = await this.priceHistoryService.getTop5HighlyCompetitiveProducts(storeId)
        const todayProfit = await this.getProfitFromOrders(storeId, 'today')
        const yesterdayProfit = await this.getProfitFromOrders(storeId, 'yesterday')
        const weekProfit = await this.getProfitFromOrders(storeId, 'week')
        const monthProfit = await this.getProfitFromOrders(storeId, 'month', startDateFromWeb, endDateFromWeb)
        const rangeDataProfit = await this.getProfitFromOrders(storeId, 'rangeData')
        let statistics = await this.storeStatisticsModel.findOne({ storeId })
        if (!statistics) {
            statistics = await new this.storeStatisticsModel({
                storeId,
            }).save()
        }

        const updateData = {
            topSellingProducts,
            // topPoorlySellingProducts,
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
        }

        // console.log(updateData)

        await this.storeStatisticsModel.updateOne(
            {
                _id: statistics._id,
            },
            updateData
        )
    }

    async getProfitFromOrders(storeId: string, dateKey: string, startDateFromWeb?: Date, endDateFromWeb?: Date) {
        if (!storeId) {
            return 0
        }

        const currentDate = new Date()

        let startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0)
        let endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 999)

        if (dateKey === 'yesterday') {
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 0, 0, 0, 0)
            endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 23, 59, 59, 999)
        } else if (dateKey === 'week') {
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7, 0, 0, 0, 0)
            endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 999)
        } else if (dateKey === 'rangeData') {
            const startYear = startDate.getFullYear()
            const startMonth = startDate.getMonth()
            const firstDayOfThisMonth = new Date(startYear, startMonth, 1)
            const lastDayOfThisMonth = new Date(startYear, startMonth + 1, 0)
            lastDayOfThisMonth.setHours(23, 59, 59)
            startDate = firstDayOfThisMonth
            endDate = lastDayOfThisMonth
        } else if (dateKey === 'month') {
            startDate = startDateFromWeb
            endDate = endDateFromWeb
        }

        const storeInfo = await this.storeModel.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(storeId),
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
                                            $eq: ['$storeId', new Types.ObjectId(storeId)],
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
        ])

        if (storeInfo.length === 0) {
            return 0
        }

        let todayProfit = 0
        for (const order of storeInfo[0].orders) {
            const product = await this.productService.getProductByQuery({
                storeId,
                'masterProduct.sku': order.productCode,
            })

            const { totalPrice, quantity, deliveryCost, productCode } = order

            let margin = 0

            let availableMinPrice = 0
            let purchasePrice = 0

            if (product) {
                availableMinPrice = product.availableMinPrice || 0
                purchasePrice = product?.purchasePrice || 0
            } else {
                console.log(`PRODUCT NOT FOUND | ${productCode} | ${storeId} | ${new Date()}`)
            }

            try {
                const calculation = await this.analyticsService.calculateProfit(productCode, totalPrice)

                const delivery = calculation.delivery[2].priceWithNDS

                const comission = ((calculation.comission / 100 * 1.16)) * totalPrice

                margin = totalPrice - delivery - (purchasePrice || availableMinPrice || 0) * quantity - comission - deliveryCost
            } catch (e) {
                // console.log('[^]' + ' store.sarvice getProfitFromOrders' + ' | ' + new Date() + ' | ' + '\n'+e);
            }

            todayProfit += margin
        }

        return Math.floor(todayProfit)
    }

    async getStoreCabinetStatistics(storeId: string, filter = 'week') {
        console.log(`GETTING STORE CABINET STATISTICS | ${storeId} | ${new Date()}`)

        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }
        const store = await this.storeModel.findOne({ _id: storeId })
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        let statistics = await this.storeStatisticsModel.findOne({ storeId })

        if (!statistics) {
            statistics = await new this.storeStatisticsModel({
                storeId,
            }).save()
        }

        if (statistics.updatedAt.getTime() < new Date().getTime() - 1000 * 60 * 5) {
            await this.calculateCabinetStatistics(storeId)
            await this.storeStatisticsModel.updateOne(
                {
                    _id: statistics._id,
                },
                {
                    updatedAt: new Date(),
                }
            )
        }

        const topSellingCities = await this.orderService.getTop5SellingCities(storeId, filter)

        const topSellingProducts = await this.orderService.getTopSellingProducts(storeId, filter)

        const sellingPerDay = await this.orderService.getOrderStatsByStoreId(storeId, filter)

        let profit = statistics.todayProfit
        if (filter === 'yesterday') {
            profit = statistics.yesterdayProfit
        } else if (filter === 'week') {
            profit = statistics.weekProfit
        } else if (filter === 'rangeData') {
            profit = statistics.rangeDataProfit
        } else if (filter === 'month') {
            profit = statistics.monthProfit
        }
        return {
            topHighlyCompetitiveProducts: statistics.topHighlyCompetitiveProducts,
            topLowMarginProducts: statistics.topLowMarginProducts,
            topMarginProducts: statistics.topMarginProducts,
            topSellingCities,
            topSellingProducts,
            sellingPerDay,
            profit,
        }
    }

    async updateApiToken(storeId: string, dto: UpdateApiTokenDto) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const store = await this.storeModel.findOne({ _id: storeId })
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        console.log(`SAVING API TOKEN ${dto.apiToken} | ${store.name} | ${new Date()}`)

        const isValidToken = await this.kaspiService.loadLastMonthOrdersFromKaspi(dto.apiToken)

        if (isValidToken) {
            await this.storeModel.updateOne(
                {
                    _id: storeId,
                },
                {
                    apiToken: dto.apiToken,
                }
            )
        }

        // axios.post(`http://164.90.232.136:8090/api/webhook?token=W9N3847TCGW9836G4TMOQWIUHGOFWYG3O4KZ8W`, {
        //     storeId,
        //     apiToken: dto.apiToken,
        //     fromDate: new Date().getTime() - 1000 * 60 * 60 * 24 * 14 - 1000 * 60 * 60,
        // })
    }

    async getStoresByQuery(query: object) {
        return await this.storeModel.find(query)
    }

    async getStoreByQuery(query: object) {
        return await this.storeModel.findOne(query)
    }

    async getStoreFinishStatistics(storeId: string) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const records = await this.storeFinishModel.find({ storeId })

        const totalRound = await this.storeFinishModel.count({ storeId })

        let lastRecord = null
        if (records.length > 0) {
            lastRecord = records[records.length - 1]
        }

        let totalTime = 0
        let totalCountProducts = 0

        for (let record of records) {
            totalTime += record.time
            totalCountProducts += record.productsCount
        }

        return {
            lastRecord,
            totalRound,
            avgTime: totalTime / records.length,
            avgCountProducts: totalCountProducts / records.length,
        }

        /*
      Последняя запись
      Средняя время круга
      Среднее количество товаров
      Количество кругов за сегодня
    */
    }

    async updateCredentials(storeId: string, dto: UpdateStoreCredentialsDto) {
        const store = await this.storeModel.findOne({
            _id: new Types.ObjectId(storeId),
        })

        if (!store) {
            throw new NotFoundException()
        }

        let apiToken = store.apiToken
        if (dto.login !== store.login) {
            apiToken = ''
        }

        await this.storeModel.updateOne(
            {
                _id: new Types.ObjectId(storeId),
            },
            {
                login: dto.login,
                password: dto.password,
                cookie: '',
                apiToken,
            }
        )
    }

    async getStorePickupPoints(storeId: string) {
        if (!isValidObjectId(storeId)) {
            return []
        }

        const pickupPoints = await this.kaspiStorePickupPointModel.find({
            storeId: new Types.ObjectId(storeId),
            status: 'ACTIVE',
        })

        return pickupPoints
    }

    async getStoreMaxDempingProducts(storeId: string) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const store = await this.storeModel.findOne({ _id: storeId }).select({
            maxDempingProducts: 1,
        })
        if (!store) {
            return 0
        }

        return store.maxDempingProducts || 0
    }

    async updateStorePhoneNumber(userId: string, storeId: string, dto: UpdateStorePhoneDto) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const foundStore = await this.storeModel.findOne({ _id: storeId })
        if (!foundStore) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        if (foundStore.userId.toString() !== userId) {
            throw new ForbiddenException()
        }

        if (foundStore.phone) {
            throw new BadRequestException(PHONE_NUMBER_ALREADY_EXISTS_ERROR)
        }

        dto.phone = dto.phone.replace(/[^+\d]/g, '')

        await this.storeModel.updateOne(
            {
                _id: foundStore._id,
            },
            {
                phone: dto.phone,
            }
        )

        dto.phone = dto.phone.replace('+7', '8')
        const response = await this.kaspiService.sendPinCode(dto.phone)

        if (response.isError) {
            throw new InternalServerErrorException('Что-то пошло не так')
        }
    }

    async loadProductsFromKaspi(userId: string, storeId: string) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
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
            })
        if (!store || store?.userId.toString() !== userId) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const integration = await this.integrationModel.findOne({ storeId: store._id })

        const marketplace = await this.marketplaceService.getMarketplace(store.marketplaceId.toString())

       

        const foundQueue = await this.productLoadQueue.findOne({
            storeId,
            isProcessing: true,
        })
        let productLoadQueueId: Types.ObjectId
        if (!foundQueue) {
            const newProductLoadQueue = await new this.productLoadQueue({
                storeId,
            }).save()

            productLoadQueueId = newProductLoadQueue._id
        } else {
            console.log(`QUEUE ALREADY EXISTS | ${store._id} | ${new Date()}`)

            productLoadQueueId = foundQueue._id
        }

        if (marketplace?.key === 'KASPI') {
            const jobOptions: JobOptions = {
                removeOnComplete: true,
                priority: 1,
                removeOnFail: true,
                jobId: productLoadQueueId.toString(),
            }
            if (integration) {
                await this.loadProductsFromXmlQueue.add(
                    {
                        storeId,
                        productLoadQueueId,
                    },
                    {
                        removeOnComplete: true,
                        priority: 1,
                        removeOnFail: true,
                    }
                )
            } else {
                await this.actualizeKaspiStorePickupPointsQueue.add(
                    {
                        storeId: storeId
                    },
                    {
                        removeOnFail: true,
                        removeOnComplete: true,
                        priority: 1
                    }
                )
                const isGenerated = await this.techRedisClient.get(`isXmlGenerated:${storeId}`)
                if(isGenerated){
                    throw new BadRequestException(`Слишком много запросов. Повторите через 15 минут`)
                } 
                await this.loadKaspiActiveProductsByXmlQueue.add(
                    {
                        storeId,
                        productLoadQueueId,
                    },
                    jobOptions
                )
                await this.loadKaspiArchiveProductsByXmlQueue.add(
                    {
                        storeId,
                        priority: 1,
                    },
                    jobOptions
                )
            }
        }

        return {
            message: `Мы начали загрузку товаров по вашему магазину: ${store.name}`,
        }
    }

    async getLoadProductsLastMessage(storeId: string) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const store = await this.storeModel.exists({ _id: storeId })
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const lastQueue = await this.productLoadQueue
            .findOne({
                storeId,
                createdAt: {
                    $gte: new Date(new Date().getTime() - 3 * 60 * 60 * 1000),
                },
            })
            .sort({ _id: -1 })

        let messages = []
        let updatedTotalCount = 0
        let totalAmount = 0

        if (lastQueue) {
            const foundMessages = await this.productLoadQueueMessage.find({
                queueId: lastQueue._id,
            })

            if (foundMessages) {
                for (let message of foundMessages) {
                    messages.push({
                        message: message.message,
                        isOk: message.isOk,
                        isError: message.isError,
                        createdAt: message.createdAt,
                    })
                }

                if (messages.length === 0) {
                    return {
                        messages,
                    }
                }

                const foundSum = await this.productLoadQueueSum.find({
                    queueId: lastQueue._id,
                })

                if (foundSum.length === 0) {
                    return {
                        messages,
                    }
                }

                for (let count of foundSum) {
                    updatedTotalCount += Number(count.updatedCount)
                    totalAmount = count.totalAmount
                }

                if (totalAmount == updatedTotalCount && totalAmount != 0) {
                    messages.push({
                        message: `Загружено: ${updatedTotalCount} из ${totalAmount} товаров. Загрузка завершена`,
                        isOk: true,
                        isError: false,
                        isLoadingFinished: true,
                    })
                    return { messages }
                }
                messages.push({
                    message: `Загружено: ${updatedTotalCount} из ${totalAmount} товаров.`,
                    isOk: true,
                    isError: false,
                })
            }
        }

        return {
            messages,
        }
    }

    async deleteLoadProductsLastMessage(storeId: string) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const store = await this.storeModel.exists({ _id: storeId })
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const queues = await this.productLoadQueue.find({
            storeId,
        })

        for (let queue of queues) {
            await this.productLoadQueueMessage.deleteMany({
                queueId: queue._id,
            })
        }
    }

    async isAuthorized(userId: string, storeId: string) {
        if (!storeId) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }
        const store = await this.storeModel.findOne({
            userId,
            _id: storeId,
        })
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const isAuth = !store.isBadCredentials

        return {
            isAuth,
        }
    }

    private async notBought() {
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
        ])

        console.log(stores.length)
    }

    // Отправка сообщения для тех, кто неделю не продлил подписку
    // через неделю, через месяц, через 3 месяца
    // private async didNotRenewTheSubscriptionWeek() {
    //   console.log('didNotRenewTheSubscription');

    //   const fromDate = 7;
    //   const tillDate = 9;

    //   const gte = new Date(
    //     new Date().getFullYear(),
    //     new Date().getMonth(),
    //     new Date().getDate() - tillDate,
    //     0,
    //     0,
    //     0,
    //     0,
    //   );
    //   const lte = new Date(
    //     new Date().getFullYear(),
    //     new Date().getMonth(),
    //     new Date().getDate() - fromDate,
    //     23,
    //     59,
    //     59,
    //     999,
    //   );
    //   console.log({
    //     lte,
    //     gte,
    //   });

    //   const stores = await this.storeModel.aggregate([
    //     {
    //       $match: {
    //         expireDate: {
    //           $gte: gte,
    //           $lte: lte,
    //         },
    //       },
    //     },
    //     {
    //       $lookup: {
    //         from: 'Payment',
    //         localField: '_id',
    //         foreignField: 'storeId',
    //         as: 'payments',
    //         let: { price: '$price' },
    //         pipeline: [
    //           {
    //             $match: {
    //               price: {
    //                 $ne: 0,
    //               },
    //             },
    //           },
    //         ],
    //       },
    //     },
    //     {
    //       $match: {
    //         payments: {
    //           $ne: [],
    //         },
    //       },
    //     },
    //     {
    //       $project: {
    //         _id: '$_id',
    //         name: '$name',
    //         expireDate: '$expireDate',
    //         payments: '$payments',
    //         userId: '$userId',
    //       },
    //     },
    //   ]);

    //   // console.log(stores, stores.length);
    // }

    // Отправка сообщения для тех, кто месяц не продлил подписку
    private async didNotRenewTheSubscriptionMonth() {
        const type = DidNotRenewTheSubscriptionTypeEnum.MONTH

        console.log('didNotRenewTheSubscription')

        const fromDate = 7
        const tillDate = 9

        const gte = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - tillDate, 0, 0, 0, 0)
        const lte = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - fromDate, 23, 59, 59, 999)
        console.log({
            lte,
            gte,
        })

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
        ])

        // console.log(stores, stores.length)
    }

    async setStartOrStop(storeId: string, dto: SetStartOrStopDto) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const store = await this.storeModel.findOne({ _id: storeId }).select({ _id: 1, name: 1, mainCity: 1 })
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const products = await this.productService.getAllProductsByStoreId(storeId)

        await Promise.all(products.map(async (product) => {
            if(product.isDemping)
                await this.actualizeProductMerchantsForProductQueue
                    .add(
                        {
                            storeId: storeId,
                            masterProductSku: product.masterProduct.sku,
                            mainCity: store.mainCity,
                            productUrl: product.url,
                        },
                        {
                            removeOnComplete: true,
                            removeOnFail: false,
                            // jobId: `${product._id}`,
                            priority: 1,
                        }
                    )
                    .catch((e) => {
                        console.error(`[ ! ] ERROR ADDING PRODUCT ACTUALIZING IN QUEUE ${product.sku} | ${store.name} | ${new Date()}\n${e}`);
                    })
        }))
        await this.storeModel.updateOne(
            { _id: storeId },
            {
                isStarted: dto.value,
            }
        )
        await new this.storeStateHistoryModel({
            storeId: store._id,
            isStarted: dto.value,
            author: 'USER',
            authorId: dto.userId,
        }).save()
        

        await this.actualizeStoreActiveProdutsHashQueue.add(
            {
                storeId,
            },
            {
                removeOnComplete: true,
                priority: 1,
                removeOnFail: true,
                jobId: storeId
            }
        )

        await this.clearXmlHashAndXmlHаshSumForStoreQueue.add(
            {
                storeId,
            },
            {
                removeOnComplete: true,
                priority: 1,
                removeOnFail: true,
            }
        )
    }

    async getGeneralStats(storeId: string, filter: string, startDateFromWeb?: Date, endDateFromWeb?: Date) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }
        const store = await this.storeModel.findOne({ _id: storeId })
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        if (startDateFromWeb) {
            startDateFromWeb.setUTCHours(startDateFromWeb.getUTCHours() - 6)
        }
        if (endDateFromWeb) {
            endDateFromWeb.setUTCHours(endDateFromWeb.getUTCHours() - 6)
        }

        const { fromDate, toDate } = this.getDateRangeByFilter(filter, startDateFromWeb, endDateFromWeb)

        const turnover = await this.orderService.getStoreTurnover(store._id, fromDate, toDate)
        const averageAmountOfSells = await this.orderService.getAverageAmountOfSells(store._id, fromDate, toDate, filter)
        const topCity = await this.orderService.getTopCity(store._id, fromDate, toDate)
        const returnOrders = await this.orderService.getReturnOrderStats(store._id, fromDate, toDate)
        const amountOfSells = await this.orderService.getAmountOfSells(store._id, fromDate, toDate)
        const profit = await this.orderService.getStoreProfit(store._id, fromDate, toDate)

        const data = {
            filter,
            turnover,
            averageAmountOfSells,
            topCity,
            return: returnOrders,
            amountOfSells,
            profit,
            createdAt: store.createdAt, // Добавляем дату создания магазина в ответ
        }
        // console.log(data)
        return data
    }

    public async getTopProducts(storeId: string, filter: string) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const products = await this.orderService.getTopSellingProducts(storeId, filter)

        return products
    }

    public async getTopMarginProducts(storeId: string) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        return this.productService.getTopMarginProducts(storeId)
    }

    public async getTopLowMarginProducts(storeId: string) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        return this.productService.getTopLowMarginProducts(storeId)
    }

    public async getChart(storeId: string, filter: string, startDateFromWeb: Date, endDateFromWeb: Date) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }
        if (startDateFromWeb) {
            startDateFromWeb.setUTCHours(startDateFromWeb.getUTCHours() - 6)
        }
        if (endDateFromWeb) {
            endDateFromWeb.setUTCHours(endDateFromWeb.getUTCHours() - 6)
        }

        const { fromDate, toDate } = this.getDateRangeByFilter(filter, startDateFromWeb, endDateFromWeb)

        const data = await this.orderService.getChart(new Types.ObjectId(storeId), fromDate, toDate, filter)

        return data
    }

    public async getProfit(storeId: string, filter: string, startDateFromWeb: Date, endDateFromWeb: Date) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }
        const store = await this.storeModel.findOne({ _id: storeId })
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        if (startDateFromWeb) {
            startDateFromWeb.setUTCHours(startDateFromWeb.getUTCHours() - 6)
        }
        if (endDateFromWeb) {
            endDateFromWeb.setUTCHours(endDateFromWeb.getUTCHours() - 6)
        }

        const { fromDate, toDate } = this.getDateRangeByFilter(filter, startDateFromWeb, endDateFromWeb)

        const profit = await this.orderService.getStoreProfit(store._id, fromDate, toDate)

        return profit
    }

    private getDateRangeByFilter(filter: string, startDateFromWeb?: Date, endDateFromWeb?: Date) {
        const currentDate = new Date()
        let fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0)
        let toDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 999)

        if (filter === 'yesterday') {
            fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 0, 0, 0, 0)
            toDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1, 23, 59, 59, 999)
        } else if (filter === 'week') {
            fromDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 7, 23, 59, 59, 999)
        }
        if (filter === 'month') {
            if (startDateFromWeb && endDateFromWeb) {
                fromDate = startDateFromWeb
                toDate = endDateFromWeb
            }
        } else if (filter === 'rangeData') {
            let startDate: Date = new Date()
            const startYear = startDate.getFullYear()
            const startMonth = startDate.getMonth()
            const firstDayOfThisMonth = new Date(startYear, startMonth, 1)
            const lastDayOfThisMonth = new Date(startYear, startMonth + 1, 0)
            lastDayOfThisMonth.setHours(23, 59, 59)
            fromDate = firstDayOfThisMonth
            toDate = lastDayOfThisMonth
        }

        // console.log(filter)

        return {
            fromDate,
            toDate,
        }
    }

    public async formatDashboardExcel(storeId: string, filter: string, res: Response) {
        const orderStatusesReport = await this.orderService.getStatusesReport(storeId)
        const generalStatus = await this.getGeneralStats(storeId, filter)
        const topProducts = await this.orderService.getTopSellingProductsByTotalPrice(storeId, filter)
        const topCities = await this.orderService.getTop5SellingCities(storeId, filter, 6)

        const getFilterName = (filter: string) => {
            if (filter === 'today') {
                return 'Сегодня'
            } else if (filter === 'yesterday') {
                return 'Вчера'
            } else if (filter === 'week') {
                return 'Неделя'
            } else if (filter === 'month') {
                return 'Выбранный Период'
            } else if (filter === 'rangeData') {
                return 'Текущий месяц'
            }
        }

        const topProductsData = () => {
            data.push(['Топ товаров по обороту'], ['Название', 'SKU', 'Кол-во продаж', 'Оборот, ₸', 'Маржа, ₸', 'Ссылка'])
            for (let i = 0; i < topProducts.length; i++) {
                data.push([
                    topProducts[i] ? topProducts[i].name : '',
                    topProducts[i] ? topProducts[i]._id : '',
                    topProducts[i] ? topProducts[i].count : '',
                    topProducts[i] ? topProducts[i].totalPrice : '',
                    topProducts[i] ? topProducts[i].profit : '',
                    topProducts[i] ? topProducts[i].url : '',
                ])
            }
            data.push([])
        }

        const topCitiesData = () => {
            data.push(
                ['Топ городов по продажам'],
                ['Город', 'Средняя цена, ₸', 'Кол-во продаж', 'Оборот, ₸', 'Средняя стоимость доставки, ₸']
            )
            for (let i = 0; i < topCities.length; i++) {
                if (topCities[i] && topCities[i]._id === 'Нет') {
                    continue
                }
                data.push([
                    topCities[i] ? topCities[i]._id : '',
                    topCities[i] ? Math.round(topCities[i].averagePrice) : '',
                    topCities[i] ? topCities[i].count : '',
                    topCities[i] ? topCities[i].totalPrice : '',
                    topCities[i] ? Math.round(topCities[i].averageDeliveryCost) : '',
                ])
            }
            data.push([])
        }

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
        ]
        topProductsData()
        topCitiesData()

        const columnWidths = [35, 15, 15, 15, 15, 30]
        const options = {
            '!cols': columnWidths.map((width) => ({ wch: width })),
            '!merges': [
                { s: { r: 4, c: 0 }, e: { r: 4, c: 5 } },
                { s: { r: 9, c: 0 }, e: { r: 9, c: 5 } },
            ],
        }

        const buffer = xlsx.build([{ name: 'SaleScout Dashboard', data, options }])
        const filePath = path.resolve('SaleScout_Dashboard.xlsx')
        writeFileSync(filePath, buffer)
        res.setHeader('allowDownload', 'true')

        res.sendFile(filePath, async (err) => {
            if (err) {
                console.error('Error sending file:', err)
            } else {
                unlinkSync(filePath)
            }
        })
    }

    public async getDashboardExcel(storeId: string, filter: string, res: Response) {
        const key = `priceListExcelDownloaded: ${storeId}`
        const limitForDownloading = 5
        const lastAttemptTimestamp = await this.redisClient.get(key)
        const remainingTimeBeforeNextAttempt = limitForDownloading * 60 * 1000 - (Date.now() - parseInt(lastAttemptTimestamp))
        if (!lastAttemptTimestamp) {
            await this.redisClient.set(key, Date.now().toString(), { EX: limitForDownloading * 60 })
            await this.formatDashboardExcel(storeId, filter, res)
        } else {
            throw new BadRequestException({
                remainingTimeBeforeNextAttempt,
            })
        }
    }

    public async showNYDiscount(userId: string) {
        if (!isValidObjectId(userId)) {
            throw new BadRequestException()
        }

        if (new Date() > new Date(1704045600000)) {
            throw new BadRequestException()
        }

        const paidStoresCount = await this.storeModel.count({
            userId,
            name: { $ne: '' },
            isTest: false,
            expireDate: {
                $gte: new Date(),
            },
        })

        if (paidStoresCount === 0) {
            return
        }

        throw new BadRequestException()
    }

    public async updateStoreSlug(storeId: string, dto: UpdateStoreSlugDto) {
        const badNames = ['public', 'icons', 'ru', 'kz', 'ref', 'xdls', 'static', 'js', 'css']
        const badSubstrings = ['.css', '.png', '.jpg', '.svg', '.html', '.js', '.json', '/']
        // console.log(dto)
        if (!isValidObjectId(storeId)) {
            throw new BadRequestException()
        }

        if (await this.storeModel.findOne({ slug: dto.slug, _id: { $ne: storeId } })) {
            //console.log(await this.storeModel.find({ slug: dto.slug }))
            throw new BadRequestException('Такой ID уже занят')
        }

        for (const substring of badSubstrings) {
            if (dto.slug.indexOf(substring) !== -1) {
                throw new BadRequestException('ID содржит недопустимые символы')
            }
        }

        if (badNames.includes(dto.slug)) {
            throw new BadRequestException('Недопустимый ID')
        }

        return await this.storeModel.updateOne({ _id: storeId }, { slug: dto.slug })
    }

    public async getStoreUploadLimit(storeId: string) {
        const merchant = await this.storeModel.findOne({ _id: storeId }, { storeId: 1 })
        if (!merchant?.storeId) {
            throw new NotFoundException('Merchant not found')
        }

        //console.log(await this.kaspiStoreUploadLimitModel.find({}))
        const limit = await this.kaspiStoreUploadLimitModel.findOne({ merchantId: merchant.storeId, limitType: 'OFFER' })

        if (!limit) {
            throw new NotFoundException(`Limit not found for merchant ${merchant.storeId}`)
        }

        return limit
    }

    async setIsDempingOnLoanPeriod(storeId: string, dto: SetIsDempingOnLoanPeriod) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }
        try {
            await this.storeModel.updateOne({ _id: storeId }, { isDempingOnLoanPeriod: dto.isDempingOnLoanPeriod })
            return { isError: false, message: 'Successfully updated' }
        } catch (error) {
            return { isError: true, message: error.message }
        }
    }

    async loadOrdersFromKaspi(userId: string, storeId: string) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
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
            })
        if (!store || store?.userId.toString() !== userId) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const marketplace = await this.marketplaceService.getMarketplace(store.marketplaceId.toString())

        try {
            if (store.login != '' && store.password != '' && (store.isBadCredentials || !store.cookie)) {
                const kaspiCookie = await this.kaspiService.authToKaspi(store.login, store.password)

                if (!kaspiCookie.isAuthorized) {
                    await this.setIsBadCredentials(store, true)
                    await this.updateCookie(store._id.toString(), '')
                    return {
                        isError: true,
                        message: `${KASPI_BAD_CREDENTIALS_ERROR}`,
                    }
                }

                await this.updateCookie(store._id.toString(), kaspiCookie.cookie)
                await this.setIsBadCredentials(store, false)
            }
            await this.updateStoreData(storeId).catch((e) => {
                console.log('[^]' + ' order.service ' + ' | ' + new Date() + ' | ' + '\n' + e)
            })
        } catch (e) {
            console.log('[^]' + ' order.service ' + ' | ' + new Date() + ' | ' + '\n' + e)
            return {
                isError: true,
                message: `Не удалось авторизоваться в Kaspi, пожалуйста попробуйте еще раз`,
            }
        }

        const foundQueue = await this.orderLoadQueue.findOne({
            storeId,
            isProcessing: true,
        })
        let orderLoadQueueId: Types.ObjectId
        if (!foundQueue) {
            const newOrderLoadQueue = await new this.orderLoadQueue({
                storeId,
            }).save()
            orderLoadQueueId = newOrderLoadQueue._id
        } else {
            console.log(`QUEUE ALREADY EXISTS | ${store._id} | ${new Date()}`)
            orderLoadQueueId = foundQueue._id
        }
        if (marketplace?.key === 'KASPI') {
            const jobOptions: JobOptions = {
                removeOnComplete: true,
                priority: 1,
                removeOnFail: true,
                jobId: orderLoadQueueId.toString(),
            }

            // const states = ['NEW', 'SIGN_REQUIRED', 'KASPI_DELIVERY', 'PICKUP', 'DELIVERY', 'ARCHIVE']
            // for(const state of states){
            //     await this.loadKaspiOrdersQueue.add(
            //         {
            //             storeId: store._id.toString(),
            //             state,
            //             status: null,
            //             dateFrom: new Date().getTime() - 14 * 24 * 60 * 60 * 1000, // now - 14 days
            //             dateTo: null,
            //         },
            //         jobOptions
            //     )
            // }
            const state = 'KASPI_DELIVERY'
            console.log(orderLoadQueueId)
            await this.loadKaspiOrdersQueue.add(
                {
                    storeId: storeId,
                    state,
                    status: null,
                    dateFrom: new Date().getTime() - 14 * 24 * 60 * 60 * 1000,
                    dateTo: null,
                    orderLoadQueueId: orderLoadQueueId,
                },
                jobOptions
            )
        }
        return {
            message: `Мы начали загрузку заказов по вашему магазину: ${store.name}`,
        }
    }
    async getLoadOrdersLastMessage(storeId: string) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }
        const store = await this.storeModel.exists({ _id: storeId })
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }
        const lastQueue = await this.orderLoadQueue
            .findOne({
                storeId,
                createdAt: {
                    $gte: new Date(new Date().getTime() - 3 * 60 * 60 * 1000),
                },
            })
            .sort({ _id: -1 })
        let messages = []
        let updatedTotalCount = 0
        let totalAmount = 0
        if (lastQueue) {
            const foundMessages = await this.orderLoadQueueMessage.find({
                queueId: lastQueue._id,
            })
            if (foundMessages) {
                for (let message of foundMessages) {
                    messages.push({
                        message: message.message,
                        isOk: message.isOk,
                        isError: message.isError,
                        createdAt: message.createdAt,
                    })
                    totalAmount += message.totalAmount
                }
                if (messages.length === 0) {
                    return {
                        messages,
                    }
                }
                const foundSum = await this.orderLoadQueueSum.find({
                    queueId: lastQueue._id,
                })
                if (foundSum.length === 0) {
                    return {
                        messages,
                    }
                }
                const first = foundSum[0].totalAmount
                for (let count of foundSum) {
                    updatedTotalCount += Number(count.updatedCount)
                }
                if (totalAmount == updatedTotalCount && totalAmount != 0) {
                    messages.push({
                        message: `Загружено: ${updatedTotalCount} из ${totalAmount} заказов. Загрузка завершена`,
                        isOk: true,
                        isError: false,
                        isLoadingFinished: true,
                    })
                    return { messages }
                }
                messages.push({
                    message: `Загружено ${updatedTotalCount} из ${totalAmount} заказов.`,
                    isOk: true,
                    isError: false,
                })
            }
        }
        return {
            messages,
        }
    }
    async deleteLoadOrdersLastMessage(storeId: string) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }
        const store = await this.storeModel.exists({ _id: storeId })
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }
        const queues = await this.orderLoadQueue.find({
            storeId,
        })
        for (let queue of queues) {
            await this.orderLoadQueueMessage.deleteMany({
                queueId: queue.id,
            })
        }
    }

    public async getTimeWhenNextXmlUpload(storeId: string) {
        const store = await this.storeModel.findOne({ _id: storeId })

        if (!store) {
            throw new NotFoundException('Merchant not found')
        }

        if (store.changePriceMethod === 'REQUEST') {
            return null
        }

        const expire = await this.kaspiStoreUploadLimitModel.findOne({ merchantId: store.storeId, limitType: "FILE" })
        const lastUploadDate = await this.xmlUploadHistoryModel.findOne({storeId: store._id, uploadStatus: 200}).sort({_id: -1})
        let nextUploadMinTime = Math.max((lastUploadDate?.createdAt?.getTime() || new Date().getTime()) + 60000 * 15, new Date().getTime() + 60000 * 5)

        if (expire) {
            if (expire.maxCount - expire.uploadedCount == 0) {
                return new Date(Math.max(expire?.expirationDate.getTime() || 0, nextUploadMinTime))
            }

            if (expire.maxCount - expire.uploadedCount == 1) {
                return new Date(Math.max(expire.expirationDate.getTime() - 60000 * 15, new Date().getTime() + 60000 * 5, nextUploadMinTime))
            }

            return new Date(Math.max(expire.expirationDate.getTime() - 60000, nextUploadMinTime))
        }

        return new Date(nextUploadMinTime)

        // const lastUploadDate = await this.xmlUploadHistoryModel.findOne({storeId: store._id, uploadStatus: 200}).sort({_id: -1})
        // if (lastUploadDate){
        //     const timeDiffLastUpload = (new Date().getTime() -  new Date(lastUploadDate.createdAt).getTime() ) / 60000
        //     if (timeDiffLastUpload <= 10){
        //         return false
            
        // }

        // const expire = await this.kaspiStoreUploadLimitModel.findOne({ merchantId: store.storeId, limitType: "FILE" })
        // if (!expire || expire.isUploading) {
        //     return false
        // }
        // const triesLeft = expire.maxCount - expire.uploadedCount
        // const timdeDiff = (expire.expirationDate.getTime() - new Date().getTime()) / 60000
        // if (triesLeft == 1) { // еще есть попытка 1, проверить, прошло ли 15 минут с момента прошлой загрузки (6:00, 6:01, 6:02, ...)
        //     if (timdeDiff <= 15) { // если осталось 15 минут или меньше, значит с момента первой загрузки прошло больше чем 15 минут уже (6:15-6:30, 6:16-6:30, 6:17-6:30 .... ), то загрузить новый прайс лист
        //         return true
        //     }
        // } else if (triesLeft == 2) { // 
        //     return true
        // }
        // return false
    }

}
