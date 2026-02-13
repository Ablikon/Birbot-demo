import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { ProxyService } from 'src/proxy/proxy.service'
import { STORE_EXPIRED_ERROR, STORE_NOT_FOUND_ERROR, USER_NOT_FOUND_ERROR } from 'src/store/store.constants'
import { MAX_DEMPING_PRODUCTS_ERROR, PRODUCT_NOT_FOUND_ERROR } from './product.constant'
import { ProductModel } from './product.model'
import { StoreService } from 'src/store/store.service'
import { MarketplaceService } from 'src/marketplace/marketplace.service'
import { StoreCityService } from 'src/store-city/store-city.service'
import { KaspiService } from 'src/store/kaspi.service'
import { isValidObjectId, Types } from 'mongoose'
import { ProductChangeModel } from './product-change.model'
import { BonusChangeModel } from './bonus-change.model'
import { ApproveProductDto } from './dto/approve-product.dto'
import { MassUpdateProductsDto } from './dto/mass-update-product'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { Product } from './product'
import { KaspiProductAvailabilityOnPickupPointModel } from './kaspi-product-availability-on-pickup-point.model'
import { KaspiCategoryComissionService } from 'src/kaspi-category-comission/kaspi-category-comission.service'
import { KaspiPromotionService } from 'src/kaspi-promotion/kaspi-promotion.service'
import { ProductDeliveryDurationEnum, ProductDeliveryDurationModel } from './product-delivery-duration.model'
import { ProductMerchantModel } from 'src/product-merchant/product-merchant.model'
import { ProductCityModel } from '../store-city/product-city.model'
import { createClient } from 'redis'
import { KaspiStorePickupPointModel } from '../store/kaspi-store-pickup-point.model'
import { distinct } from 'rxjs'
import { ChangePriceRequestResultModel } from './change-price-request-result.model'
import { ApproveProductForSaleHistoryModel } from './approve-product-for-sale-history.model'
import { StoreModel } from 'src/store/store.model'
import { GoldLinkedProductModel } from './gold-linked-product.model'
import { AnalyticsProductModel } from './analytics-product.model'
import { AnalyticsService } from 'src/analytics/analytics.service'
import { PrivilegedStoreService } from 'src/privileged-store/privileged-store.service'

@Injectable()
export class ProductService {
    private readonly techRedisClient = createClient({
        url: process.env.TECH_REDIS_URL || '',
    })

    constructor(
        @InjectModel(ProductModel)
        private readonly productModel: ModelType<ProductModel>,
        @InjectModel(ProductCityModel)
        private readonly ProductCityModel: ModelType<ProductCityModel>,
        @InjectModel(KaspiProductAvailabilityOnPickupPointModel)
        private readonly kaspiProductAvailabilityOnPickupPointModel: ModelType<KaspiProductAvailabilityOnPickupPointModel>,
        @InjectModel(KaspiStorePickupPointModel)
        private readonly kaspiStorePickupPointModel: ModelType<KaspiStorePickupPointModel>,
        @InjectModel(ProductChangeModel)
        private readonly productChangeModel: ModelType<ProductChangeModel>,
        @InjectModel(AnalyticsProductModel)
        private readonly analyticsProductModel: ModelType<AnalyticsProductModel>,
        @InjectModel(BonusChangeModel)
        private readonly bonusChangeModel: ModelType<BonusChangeModel>,
        @InjectModel(ProductDeliveryDurationModel)
        private readonly productDeliveryDurationModel: ModelType<ProductDeliveryDurationModel>,
        @InjectModel(ProductMerchantModel)
        private readonly productMerchantModel: ModelType<ProductMerchantModel>,
        @InjectModel(ChangePriceRequestResultModel)
        private readonly changePriceRequestResultModel: ModelType<ChangePriceRequestResultModel>,
        @InjectModel(ApproveProductForSaleHistoryModel)
        private readonly approveProductForSaleHistoryModel: ModelType<ApproveProductForSaleHistoryModel>,
        @InjectModel(GoldLinkedProductModel)
        private readonly goldLinkedProductModel: ModelType<GoldLinkedProductModel>,
        private readonly pproxyService: ProxyService,
        @Inject(forwardRef(() => StoreService))
        private readonly storeService: StoreService,
        // @Inject(forwardRef(() => MarketplaceService))
        private readonly marketplaceService: MarketplaceService,
        @Inject(forwardRef(() => StoreCityService))
        private readonly storeCityService: StoreCityService,
        private readonly kaspiService: KaspiService,
        private readonly product: Product,
        private readonly kaspiCategoryComissionService: KaspiCategoryComissionService,
        private readonly kaspiPromotionService: KaspiPromotionService,
        private readonly analyticsService: AnalyticsService,
        private readonly privilegedStoreService: PrivilegedStoreService,
        @InjectQueue('actualize-product-merchants-for-product-queue') private actualizeProductMerchantsForProductQueue: Queue,
        @InjectQueue('approve-or-withdraw-product-queue') private approveOrWithdrawProductQueue: Queue,
        @InjectQueue('demping-tasks-for-product-changer-manager-queue') private readonly dempingTasksForProductChangerManagerQueue: Queue,
    ) {
        this.techRedisClient.connect().then(() => {
            console.log(`TECH REDIS IN PRODUCT SERVICE CONNECTED`)
        })
    }

    async getProductByStoreIdAndMasterProductSku(masterProductSku: string, storeId: string) {
        return this.productModel.findOne({
            storeId,
            'masterProduct.sku': masterProductSku,
        })
    }

    async sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    async test() {
        await this.sleep(1000)

        this.getProductCount('623bf069311277acd04d879c')
    }

    private async isGoldLinkedProduct(masterProductSku: string): Promise<boolean> {
        try {
            const analyticsProduct = await this.analyticsProductModel.find({ sku: masterProductSku }).select({ _id: 1 }).lean()

            if (!analyticsProduct) {
                return false
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
                .exec()
            return isGoldConnected.length > 0
        } catch (error) {
            console.error(`Error checking gold-linked product for SKU ${masterProductSku}:`, error)
            return false
        }
    }

    async getProductById(productId: string) {
        if (!isValidObjectId(productId)) {
            return null
        }

        const products = await this.productModel.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(productId),
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
        ])

        if (products.length === 0) {
            throw new NotFoundException()
        }

        const product = products[0]

        const masterProduct = await this.analyticsService.getProductBySku(product.masterProductSku)
        let categoryCode = (product?.categoryCode || '').replace('Master -', '').trim()
        let category = await this.kaspiCategoryComissionService.getCategoryByCode(categoryCode, false)
        if (!category) {
            categoryCode = (masterProduct?.category?.code || '').replace('Master -', '').trim()

            category = await this.kaspiCategoryComissionService.getCategoryByCode(categoryCode, false)
        }
        const categoryPromotion = await this.kaspiPromotionService.getPromotionCategory(categoryCode)

        const availabilitiesKey = `kaspiProductAvailabilityOnPickupPoints:${product._id}`
        let availabilities: any = await this.techRedisClient.zRange(availabilitiesKey, 0, -1)
        if (availabilities.length > 0) {
            availabilities = availabilities.map((item) => {
                const parsedItem = JSON.parse(item)
                return {
                    storePickupPointId: parsedItem.storePickupPointId,
                    productId: parsedItem.productId,
                    available: parsedItem.available,
                    preOrder: parsedItem.preOrder,
                    amount: parsedItem.amount,
                }
            })
        } else {
            const availabilitiesFromDb = await this.kaspiProductAvailabilityOnPickupPointModel.find({ productId: product._id })

            availabilities = availabilitiesFromDb.map((availability) => ({
                storePickupPointId: availability.storePickupPointId,
                productId: availability.productId,
                available: availability.available,
                preOrder: availability.preOrder,
                amount: availability.amount,
            }))

            for (const availability of availabilitiesFromDb) {
                await this.techRedisClient.zAdd(availabilitiesKey, { score: 0, value: JSON.stringify(availability) })
            }
            await this.techRedisClient.expire(availabilitiesKey, 2 * 60 * 60)
        }

        return {
            ...product,
            availabilities,
            category: category
                ? {
                      title: category.title,
                      code: category.code,
                      comissionPercent: category.comissionStart,
                      comissionPercentOnPromotion: categoryPromotion?.percent || null,
                  }
                : null,
            weight: masterProduct?.weight || 0,
        }
    }

    //
    //
    //

    async getCancelsMetric(id: string): Promise<any> {
        const store = await this.storeService.getStoreById(id)

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
        })

        if (!response.ok) {
            const errorData = await response.json()
            throw new Error(`Kaspi API error: ${JSON.stringify(errorData)}`)
        }

        const data = await response.json()
        return data
    }
    //
    //
    //

    async getActiveProductsCount(storeId: string) {
        return this.productModel.count({
            storeId,
            isActive: true,
            isDemping: true,
        })
    }

    async getProductCount(storeId: string) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }
        const store = await this.storeService.getStoreById(storeId)
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }
        const hasGoldFeature = (await this.techRedisClient.get(`featureStoreAccess:${storeId}:PRICE_CHANGE_ON_GOLD_RATE`)) === '1'

        if (store.expireDate < new Date() && !hasGoldFeature) {
            throw new NotFoundException(STORE_EXPIRED_ERROR)
        }

        const todayDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
        const last24Hours = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)
        const newProducts = await this.productModel.count({
            storeId,
            isActive: true,
            createdAt: {
                $gte: last24Hours,
            },
        })

        let preOrderCount = 0
        const preOrder = await this.productModel.aggregate([
            {
                $match: {
                    storeId: new Types.ObjectId(storeId),
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
        ])

        if (Array.isArray(preOrder) && preOrder.length > 0) {
            preOrderCount = preOrder[0]?.total
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
        }
    }

    async getProductsByStoreId(
        storeId: string,
        limit: number,
        page: number,
        query = '',
        filter = 'all',
        sortBy = '',
        selectedCityId: string = ''
    ) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const store = await this.storeService.getStoreById(storeId)
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const hasGoldFeature = (await this.techRedisClient.get(`featureStoreAccess:${storeId}:PRICE_CHANGE_ON_GOLD_RATE`)) === '1'

        if (store.expireDate < new Date() && !hasGoldFeature) {
            throw new NotFoundException(STORE_EXPIRED_ERROR)
        }

        const escapeRegExp = (string: string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        }

        const escapedQuery = escapeRegExp(query)
        const q: any = {
            isActive: true,
            storeId: new Types.ObjectId(storeId),
            ...this.getFilterQuery(filter),
            $and: [
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
            ],
        }

        let sort: any = {
            kaspiCabinetPosition: 1,
        }
        if (sortBy) {
            if (sortBy === 'asc') {
                sort = {
                    name: 1,
                }
            } else if (sortBy === 'desc') {
                sort = {
                    name: -1,
                }
            }
        }
        if (filter === 'minus') {
            sort = {
                place: 1,
            }
        }
        if (filter === 'min-price-achieved') {
            sort = {
                place: 1,
            }
        }
        const skip = (page - 1) * limit

        let products = []

        // console.log('Start')

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
        else{
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
            ])
        }

        // console.log(products)

        const data: any[] = []

        const masterProductSkus = products.map((p) => p.masterProductSku).filter(Boolean)

        // Получаем мануальные настройки привязки к золоту
        const manualGoldSettings = await this.getGoldLinkedProductsMap(storeId)

        // Автоматическое определение золотых товаров из аналитики
        const goldProductsMap = new Map<string, boolean>()
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
                    .exec()

                goldProducts.forEach((gp) => {
                    goldProductsMap.set(gp.sku, true)
                })
            } catch (error) {
                console.error('Error fetching gold products in batch:', error)
            }
        }

        for (const product of products) {
            try {
                let margin = 0

                // try {
                //     const calculate = await this.analyticsService.calculateProfit(product.masterProductSku, product.price)
                //     const deliveryCost = calculate.delivery[2]?.priceWithNDS || 0
                //     const commission = ((calculate?.comission || 0) / 100) * product.price
                //     margin = product.price - (deliveryCost + commission + (product.purchasePrice || product.availableMinPrice || 0))
                // } catch (e) {
                //     margin = product.price - (product.purchasePrice || product.availableMinPrice || 0)
                // }

                // Определяем статус привязки к золоту
                const isAutoGoldDetected = goldProductsMap.get(product.masterProductSku) || false
                let isGoldConnected = false
                const manualSetting = manualGoldSettings.get(product._id.toString())

                if (manualSetting !== undefined) {
                    // Если есть мануальная настройка - используем её
                    isGoldConnected = manualSetting
                } else {
                    // Иначе - автоматическое определение
                    isGoldConnected = isAutoGoldDetected
                }

                data.push({
                    ...product,
                    margin,
                    isGoldConnected,
                    isAutoGoldDetected,
                })

                this.storeCityService.getProductCities(product._id)
            } catch (e) {
                console.log('[^]' + ' product.service ' + ' | ' + new Date() + ' | ' + '\n' + e)
            }
        }

        let preOrderCount = 0

        if (filter === 'preorder') {
            const preOrder = await this.productModel.aggregate([
                {
                    $match: {
                        storeId: new Types.ObjectId(storeId),
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
            ])
            if (Array.isArray(preOrder) && preOrder.length > 0) {
                preOrderCount = preOrder[0]?.total
            }
        }

        const count = filter !== 'preorder' ? await this.productModel.countDocuments(q) : preOrderCount
        const total = await this.productModel.countDocuments({
            storeId,
            isActive: true,
        })

        return {
            data,
            count,
            limit,
            page,
            total,
            filter,
            query,
        }
    }

    private getFilterQuery(filter: string) {
        if (filter === 'first') {
            return {
                place: 1,
                isDemping: true,
                isMinus: false,
            }
        } else if (filter === 'changing') {
            return {
                isChanging: true,
                isDemping: true,
                place: {
                    $ne: 1,
                },
                isMinus: false,
            }
        } else if (filter === 'minus') {
            return {
                isMinus: true,
                isDemping: true,
            }
        } else if (filter === 'min-price-achieved') {
            console.log('min price log')
            return {
                isDemping: true,
                isActive: true,
                $expr: { $eq: ['$availableMinPrice', '$price'] },
            }
        } else if (filter === 'off') {
            return {
                isDemping: false,
            }
        } else if (filter === 'archive') {
            return {
                isActive: false,
            }
        } else if (filter === 'on') {
            return {
                isDemping: true,
            }
        } else if (filter === 'no-competitors') {
            return {
                isDemping: true,
                offersCount: 1,
            }
        } else if (filter === 'new-products') {
            // const todayDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
            const last24Hours = new Date(new Date().getTime() - 24 * 60 * 60 * 1000)

            return {
                createdAt: {
                    $gte: last24Hours,
                },
            }
        } else if (filter === 'waiting') {
            return {
                isDemping: true,
                isChanging: false,
                place: {
                    $ne: 1,
                },
                isMinus: false,
            }
        } else if (filter === 'active-products-no-min-price') {
            return {
                isActive: true,
                availableMinPrice: 0,
            }
        } else if (filter === 'archive-products-no-min-price') {
            return {
                isActive: false,
                availableMinPrice: 0,
            }
        } else if (filter === 'preorder') {
            return {}
        } else if (filter === 'not-set-min-price') {
            return {
                isActive: true,
                isSetMinPrice: false,
            }
        }

        return {}
    }

    async getAllProductsByStoreId(storeId: string) {
        const products = await this.productModel.find({
            storeId,
            isActive: true,
        })

        return products
    }

    async getFilerProductsByStoreId(storeId: string, isActive?: boolean, isDemping?: boolean, limit?: number, skip?: number) {
        const query: any = { storeId }

        if (isActive !== undefined) {
            query.isActive = isActive
        }

        if (isDemping !== undefined) {
            query.isDemping = isDemping
        }

        const products = await this.productModel
            .find(query)
            .skip(skip || 0)
            .limit(limit || 0)
        return products
    }

    async getProductBySku(sku: string) {
        const product = this.productModel.findOne({ sku })

        return product
    }

    async getProductStatistics(minusDay = 0) {
        let lteDate = new Date()
        if (minusDay !== 0) {
            lteDate = new Date(
                new Date(
                    Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - minusDay, 23, 59, 59, 999)
                ).getTime() -
                    6 * 60 * 60 * 1000
            )
        }

        const date = new Date(
            new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - minusDay)).getTime() -
                6 * 60 * 60 * 1000
        )

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
        }
    }

    async withdrawFromSale(products: string[], storeId: string) {
        if (products.length === 0) {
            return
        }

        const store = await this.storeService.getStoreById(storeId)
        const marketplace = await this.marketplaceService.getMarketplace(store.marketplaceId.toString())

        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        for (const product of products) {
            const exists = await this.productModel.exists({
                storeId,
                sku: product,
            })
            if (!exists) {
                continue
            }

            await this.product.updateProduct(exists._id.toString(), {
                isDemping: false,
            })

            if (marketplace.key === 'KASPI') {
                await this.approveOrWithdrawProductQueue.add(
                    {
                        type: 'withdraw',
                        data: {
                            storeId,
                            productId: exists._id.toString(),
                            method: 'MANUALLY',
                        },
                    },
                    {
                        removeOnComplete: true,
                        removeOnFail: true,
                    }
                )
            }
          
        }
    }

    private async isAvailable( productId: string ){
        const availabilities = await this.kaspiProductAvailabilityOnPickupPointModel.find({productId})
        if(!availabilities) return false
        for(const availability of availabilities){
            const product = await this.productModel.findOne({ _id: productId })
            if(availability.available === true && (availability.amount > 0 || availability.amount === null || product.isPreOrder)){
                return true;
            }
        }
        return false
    }

    async approve(storeId: string, dto: ApproveProductDto) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const store = await this.storeService.getStoreById(storeId)
        const marketplace = await this.marketplaceService.getMarketplace(store.marketplaceId.toString())
        const skuOfProductsWithNoPrices: string[] = []
        const skuOfProductsWithNoAvailabilities: string[] = []
        const productToApprove: ProductModel[] = []
        for (const sku of dto.products) {
            const foundProduct = await this.productModel.findOne({
                storeId,
                sku,
            })

            if (!foundProduct) {
                throw new NotFoundException(`${PRODUCT_NOT_FOUND_ERROR}: ${sku}`)
            }

            if(foundProduct.price === null){
                skuOfProductsWithNoPrices.push(foundProduct.sku)
            }
            if(!await this.isAvailable(foundProduct._id.toString())){
                skuOfProductsWithNoAvailabilities.push(foundProduct.sku)
            }

            if (marketplace.key === 'KASPI') {
                productToApprove.push(foundProduct)
            }

          
        }
        if (skuOfProductsWithNoPrices.length > 0) {
            throw new BadRequestException(
                `Нужно указать цену перед выставлением ${skuOfProductsWithNoPrices.length > 1? 'товаров': 'товара'}:\n${skuOfProductsWithNoPrices.map(sku => sku).join(', ')}`
            );
        }
        else if (skuOfProductsWithNoAvailabilities.length > 0) {
            throw new BadRequestException(
                `Нужно указать наличие перед выставлением ${skuOfProductsWithNoAvailabilities.length > 1? 'товаров': 'товара'}:\n${skuOfProductsWithNoAvailabilities.map(sku => sku).join(', ')}`
            );
        }
        else{
            for(const foundProduct of productToApprove){
                await this.approveOrWithdrawProductQueue.add(
                    {
                        type: 'approve',
                        data: {
                            storeId,
                            productId: foundProduct._id.toString(),
                            method: 'MANUALLY',
                        },
                    },
                    {
                        removeOnComplete: true,
                        removeOnFail: true,
                    }
                )
            }
        }
    }

    async getProductByQuery(q: object, sort: 1 | -1 = -1) {
        return this.productModel.findOne(q).sort({
            _id: sort,
        })
    }

    async getProductsByQuery(q: object, sort: 1 | -1 = -1) {
        return this.productModel.find(q).sort({
            _id: sort,
        })
    }

    async getProductsForMobileApp(userId: string, storeId: string) {
        if (!isValidObjectId(userId)) {
            throw new BadRequestException(USER_NOT_FOUND_ERROR)
        }
        if (!isValidObjectId(storeId)) {
            throw new BadRequestException(STORE_NOT_FOUND_ERROR)
        }
        return await this.productModel.find({ storeId })
    }

    async getTopLowMarginProducts(storeId: string, limit: number = 10) {
        if (!isValidObjectId(storeId)) {
            return []
        }

        return await this.productModel.aggregate([
            {
                $match: {
                    storeId: new Types.ObjectId(storeId),
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
        ])
    }

    async getTopMarginProducts(storeId: string, limit: number = 10) {
        if (!isValidObjectId(storeId)) {
            return []
        }

        return await this.productModel.aggregate([
            {
                $match: {
                    storeId: new Types.ObjectId(storeId),
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
        ])
    }

    async getProductChangingStatistics() {
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
        ])

        const minProductTime = await this.productChangeModel
            .findOne({
                changedDate: {
                    $ne: null,
                },
            })
            .sort({
                time: 1,
            })

        const maxProductTime = await this.productChangeModel
            .findOne({
                changedDate: {
                    $ne: null,
                },
            })
            .sort({
                time: -1,
            })

        const maxStore = await this.storeService.getStoreById(maxProductTime?.storeId?.toString())
        const minStore = await this.storeService.getStoreById(minProductTime?.storeId?.toString())

        const maxProductCount = await this.productModel.count({
            storeId: maxStore?._id,
        })
        const minProductCount = await this.productModel.count({
            storeId: minStore?._id,
        })

        return {
            ...averageTime,
            maxStoreInfo: {
                storeName: maxStore?.name,
                productCount: maxProductCount,
                registrationDate: maxStore?.createdAt,
            },
            minStoreInfo: {
                storeName: minStore?.name,
                productCount: minProductCount,
                registrationDate: minStore?.createdAt,
            },
        }
    }

    async massUpdateProducts(userId: string, storeId: string, dto: MassUpdateProductsDto) {
        console.log(`massUpdateProducts | ${storeId} | ${new Date()}`)

        const store = await this.storeService.getStoreById(storeId)
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        if (store.userId.toString() !== userId) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        if (dto.isApplyDempingPriceToEverything) {
            const updateFilter = {
                isActive: true,
                storeId: store._id.toString(),
                ...this.getFilterQuery(dto.choosedFilter),
            }

            if (dto.isDemping) {
                const products = await this.productModel.find(updateFilter)

                const productIds = products.map((product) => product._id.toString())
                Promise.all(products.map( product => {
                    if(dto.productsId.find(productId => productId === product._id.toString()))
                        this.actualizeProductMerchantsForProductQueue
                            .add(
                                {
                                    storeId: product.storeId,
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
                            .then(() => {
                                console.log(`ADDED PRODUCT MERCHANT ACTUALIZING IN QUEUE ${product.sku} | ${product.masterProduct.sku} | ${store.name} | ${new Date()}\n`)
                            })
                            .catch((e) => {
                                console.error(`[ ! ] ERROR ADDING PRODUCT MERCHANT ACTUALIZING IN QUEUE ${product.sku} | ${store.name} | ${new Date()}\n${e}`);
                            })
                }))

                await this.checkActiveProductsLimit(store._id, productIds)
            }

            if (dto.isSelectedCityId && store.mainCity.id !== dto.isSelectedCityId) {
                const storeCityId = await this.storeCityService.getStoreCity(storeId, dto.isSelectedCityId)

                await this.ProductCityModel.updateMany({ storeCityId: storeCityId._id.toString(), ...updateFilter }, dto)
            } else {
                // Получаем продукты до обновления для истории изменений
                const productsBeforeUpdate = await this.productModel.find(updateFilter)
                
                await this.productModel.updateMany(updateFilter, dto)

                // Сохраняем историю изменений бонусов для каждого обновленного продукта
                if (this.hasBonusChanges(dto)) {
                    for (const product of productsBeforeUpdate) {
                        try {
                            await this.saveBonusChangeHistory(
                                product._id.toString(),
                                product.storeId.toString(),
                                product.sku,
                                store.name,
                                product.bonus,
                                dto.bonus,
                                product.minBonus,
                                dto.minBonus,
                                product.maxBonus,
                                dto.maxBonus,
                                product.isBonusDemping,
                                dto.isBonusDemping,
                                'MANUAL',
                                null
                            )
                        } catch (error) {
                            console.error(`[ ! ] ERROR SAVING BONUS CHANGE HISTORY FOR MASS UPDATE | ${product.sku} | ${store.name} | ${new Date()}\n${error}`)
                        }
                    }
                }
            }

            if (dto.preorderDate && dto.preorderDate.length > 0) {
                for (const warehouse of dto.preorderDate) {
                    const pickup = await this.kaspiStorePickupPointModel.findOne({
                        storeId: store._id,
                        displayName: warehouse.displayName,
                    })
                    await Promise.all(
                        dto.productsId.map(async (productId) => {
                            const storePickupPoint = pickup
                            const product = await this.productModel.findOne({ _id: productId, storeId: store._id })
                            if (!storePickupPoint) {
                                return
                            } else if (storePickupPoint.storeId.toString() !== product.storeId.toString()) {
                                return
                            }
                            if (!product) return
                            // создаем key для обновления в редисе
                            const storePickupPointId = storePickupPoint._id
                            // Тут мы берем ключ по товару для обновления отсортированного сэта
                            const collectionKey = `kaspiProductAvailabilityOnPickupPoints:${productId}`

                            const exists = await this.kaspiProductAvailabilityOnPickupPointModel.findOne({
                                storePickupPointId,
                                productId: product._id,
                            })

                            if (exists) {
                                await this.kaspiProductAvailabilityOnPickupPointModel.updateOne(
                                    {
                                        storePickupPointId,
                                        productId: product._id,
                                    },
                                    {
                                        amount: exists.amount,
                                        preOrder: warehouse.newPreorderDates,
                                        available: exists.available,
                                    }
                                )

                                // Обновляем редис
                                const collectionData = await this.kaspiProductAvailabilityOnPickupPointModel.find({
                                    productId: product._id,
                                })
                                await this.techRedisClient.del(collectionKey)
                                for (const item of collectionData) {
                                    await this.techRedisClient.zAdd(collectionKey, { score: 0, value: JSON.stringify(item) })
                                }
                                await this.techRedisClient.expire(collectionKey, 2 * 60 * 60)
                            } else {
                                // Создаем в базе
                                await new this.kaspiProductAvailabilityOnPickupPointModel({
                                    storePickupPointId,
                                    productId: product._id,
                                    amount: 0,
                                    preOrder: warehouse.newPreorderDates,
                                    available: false,
                                }).save()

                                //создаем в редисе
                                const collectionData = await this.kaspiProductAvailabilityOnPickupPointModel.find({
                                    productId: product._id,
                                })
                                await this.techRedisClient.del(collectionKey)
                                for (const item of collectionData) {
                                    await this.techRedisClient.zAdd(collectionKey, { score: 0, value: JSON.stringify(item) })
                                }
                                await this.techRedisClient.expire(collectionKey, 2 * 60 * 60)
                            }
                            if (product.isActive && store.expireDate > new Date()) {
                                const foundProduct = await this.productModel.findOne({ _id: product._id })
                                if (!foundProduct) {
                                    return
                                }

                                await this.addJobToQueueForProductChanger(store, foundProduct)
                            }
                        })
                    )
                }
            }
        } else {
            if (dto.isDemping) {
                await this.checkActiveProductsLimit(store._id, dto.productsId)
            }

            for (const productId of dto.productsId) {
                if (!isValidObjectId(productId)) {
                    throw new NotFoundException(PRODUCT_NOT_FOUND_ERROR)
                }

                const product = await this.productModel.findOne({ _id: productId })
                if(dto.isDemping){
                    this.actualizeProductMerchantsForProductQueue
                        .add(
                            {
                                storeId: product.storeId,
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
                        .then(() => {
                            console.log(`ADDED PRODUCT MERCHANT ACTUALIZING IN QUEUE ${product.sku} | ${product.masterProduct.sku} | ${store.name} | ${new Date()}\n`)
                        })
                        .catch((e) => {
                            console.error(`[ ! ] ERROR ADDING PRODUCT MERCHANT ACTUALIZING IN QUEUE ${product.sku} | ${store.name} | ${new Date()}\n${e}`);
                        })
    
                }
                if (!product || product?.storeId.toString() !== storeId) {
                    throw new NotFoundException(PRODUCT_NOT_FOUND_ERROR)
                }
            }

            if (dto.isSelectedCityId && store.mainCity.id !== dto.isSelectedCityId) {
                const storeCityId = await this.storeCityService.getStoreCity(storeId, dto.isSelectedCityId)
                for (const productId of dto.productsId) {
                    await this.ProductCityModel.updateOne(
                        {
                            productId,
                            storeCityId: storeCityId._id.toString(),
                        },
                        dto
                    )
                }
            } else {
                for (const productId of dto.productsId) {
                    await this.product.updateProduct(productId.toString(), dto)
                }
            }
            if (dto.preorderDate && dto.preorderDate.length > 0) {
                for (const warehouse of dto.preorderDate) {
                    const pickup = await this.kaspiStorePickupPointModel.findOne({
                        storeId: store._id,
                        displayName: warehouse.displayName,
                    })
                    await Promise.all(
                        dto.productsId.map(async (productId) => {
                            const storePickupPoint = pickup
                            const product = await this.productModel.findOne({ _id: productId, storeId: store._id })
                            if (!storePickupPoint) {
                                return
                            } else if (storePickupPoint.storeId.toString() !== product.storeId.toString()) {
                                return
                            }
                            if (!product) return
                            // создаем key для обновления в редисе
                            const storePickupPointId = storePickupPoint._id
                            // Тут мы берем ключ по товару для обновления отсортированного сэта
                            const collectionKey = `kaspiProductAvailabilityOnPickupPoints:${productId}`

                            const exists = await this.kaspiProductAvailabilityOnPickupPointModel.findOne({
                                storePickupPointId,
                                productId: product._id,
                            })

                            if (exists) {
                                await this.kaspiProductAvailabilityOnPickupPointModel.updateOne(
                                    {
                                        storePickupPointId,
                                        productId: product._id,
                                    },
                                    {
                                        amount: exists.amount,
                                        preOrder: warehouse.newPreorderDates,
                                        available: exists.available,
                                    }
                                )

                                // Обновляем редис
                                const collectionData = await this.kaspiProductAvailabilityOnPickupPointModel.find({
                                    productId: product._id,
                                })
                                await this.techRedisClient.del(collectionKey)
                                for (const item of collectionData) {
                                    await this.techRedisClient.zAdd(collectionKey, { score: 0, value: JSON.stringify(item) })
                                }
                                await this.techRedisClient.expire(collectionKey, 2 * 60 * 60)
                            } else {
                                // Создаем в базе
                                await new this.kaspiProductAvailabilityOnPickupPointModel({
                                    storePickupPointId,
                                    productId: product._id,
                                    amount: 0,
                                    preOrder: warehouse.newPreorderDates,
                                    available: false,
                                }).save()

                                //создаем в редисе
                                const collectionData = await this.kaspiProductAvailabilityOnPickupPointModel.find({
                                    productId: product._id,
                                })
                                await this.techRedisClient.del(collectionKey)
                                for (const item of collectionData) {
                                    await this.techRedisClient.zAdd(collectionKey, { score: 0, value: JSON.stringify(item) })
                                }
                                await this.techRedisClient.expire(collectionKey, 2 * 60 * 60)
                            }
                            if (product.isActive && store.expireDate > new Date()) {
                                const foundProduct = await this.productModel.findOne({ _id: product._id })
                                if (!foundProduct) {
                                    return
                                }

                                await this.addJobToQueueForProductChanger(store, foundProduct)
                            }
                        })
                    )
                }
            }
        }
    }
    private async addJobToQueueForProductChanger(store: StoreModel, product: ProductModel) {
        const storeCities = await this.storeCityService.getStoreCities(store._id.toString())
        const additionalCities = storeCities.map((v) => {
            return {
                _id: v._id,
                cityId: v.cityId,
            }
        })

        await this.dempingTasksForProductChangerManagerQueue.add(
            {
                productId: product._id.toString(),
                storeId: store._id,
                additionalCities,
            },
            {
                removeOnComplete: true,
                removeOnFail: true,
            }
        )

        console.log(`ADDED TASK FOR PRODCUT CHANGE | ${product.sku} | ${store.name} | ${new Date()}`)
    }
    async checkActiveProductsLimit(storeId: Types.ObjectId, productsId: string[] = []) {
        const isPriviligedStore = await this.privilegedStoreService.isPrivileged(storeId.toString())
        if (isPriviligedStore) {
            return
        }

        const query: any = {
            $or: [
                {
                    storeId,
                    isActive: true,
                    isDemping: true,
                },
            ],
        }

        const $or = []
        for (const productId of productsId) {
            if (!isValidObjectId(productId)) {
                continue
            }

            query['$or'].push({
                _id: new Types.ObjectId(productId),
            })
        }
        if ($or.length > 0) {
            query['$or'] = $or
        }

        const maxActiveProductsLimit = await this.storeService.getStoreMaxDempingProducts(storeId.toString())

        const count = await this.productModel.count(query)

        if (maxActiveProductsLimit < count) {
            throw new BadRequestException(MAX_DEMPING_PRODUCTS_ERROR)
        }
    }

    public async getProductImage(masterSku: string) {
        const product = await this.productModel
            .findOne({ 'masterProduct.sku': masterSku })
            .sort({ updatedAt: -1 })
            .select({ img: 1 })
            .limit(1)

        if (!product) {
            return null
        }

        return product.img
    }

    public async changeProductDeliveryDuration(storeId: string, productSku: string, updatedDeliveryDurations: string[]) {
        try {
            const deliveryDurations = await this.productDeliveryDurationModel.findOne({
                storeId: new Types.ObjectId(storeId),
                sku: productSku,
            })
            if (deliveryDurations) {
                await this.productDeliveryDurationModel.updateOne(
                    { storeId: new Types.ObjectId(storeId), sku: productSku },
                    { deliveryDuration: updatedDeliveryDurations }
                )
            } else {
                await new this.productDeliveryDurationModel({
                    storeId: new Types.ObjectId(storeId),
                    sku: productSku,
                    deliveryDuration: updatedDeliveryDurations,
                }).save()
            }
            const product = await this.productModel.findOne({ storeId: new Types.ObjectId(storeId), sku: productSku })
            await this.productMerchantModel.updateMany(
                {
                    masterProductSku: product.masterProduct.sku,
                    productUrl: {
                        $regex: /kaspi/i,
                    },
                },
                { isFullOffersParse: true }
            )
            return { success: true, message: `Operation completed successfully. isFullOffersParse was set to true` }
        } catch (error) {
            // console.error(`An error occurred: ${error.message}`);
            console.log('[^]' + ' product.service ' + ' | ' + new Date() + ' | ' + 'An error occurred' + ' | ' + '\n' + error)
            return { success: false, error: error.message }
        }
    }

    public async getProductDeliveryDuration(storeId: string, productSku: string) {
        const deliveryDurations = await this.productDeliveryDurationModel.findOne({ storeId: new Types.ObjectId(storeId), sku: productSku })

        if (!deliveryDurations) {
            return 'all'
        }

        return deliveryDurations
    }

    public async getProductsRequests(storeId: string) {
        const productsRequests = await this.changePriceRequestResultModel.aggregate([
            {
                $match: {
                    'storeId': new Types.ObjectId(storeId),
                    // createdAt: {$gt: new Date(new Date().getTime() - 60 * 60 * 1000)},
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
        ])

        const approveProductsRequests = await this.approveProductForSaleHistoryModel
            .find(
                {
                    storeId: new Types.ObjectId(storeId),
                    createdAt: { $gt: new Date(new Date().getTime() - 60 * 60 * 1000) },
                    status: 200,
                },
                {
                    productId: 1,
                    createdAt: 1,
                    type: 'approve',
                }
            )
            .limit(250)

        const allRequests = [...productsRequests, ...approveProductsRequests]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, 250)

        const productsInfo = await this.productModel.aggregate([
            {
                $match: {
                    storeId: new Types.ObjectId(storeId),
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
        ])

        const productsRequestsWithInfo = allRequests.map((productRequest) => {
            const productInfo = productsInfo.find((product) => product._id.toString() === productRequest.productId.toString())
            return {
                createdAt: productRequest.createdAt.toISOString(),
                type: productRequest.type,
                name: productInfo.name,
                url: productInfo.url,
                sku: productInfo.sku,
                img: productInfo.img,
            }
        })

        return {
            products: productsRequestsWithInfo,
        }
    }

    public async deleteProductDeliveryDuration(storeId: string, productSku: string) {
        try {
            await this.productDeliveryDurationModel.deleteOne({ storeId: new Types.ObjectId(storeId), sku: productSku })

            const product = await this.productModel.findOne({ storeId: new Types.ObjectId(storeId), sku: productSku })

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
            ]

            const result = await this.productModel.aggregate(aggregateQuery)

            let isFullOffersParse = result.some((product) => product.hasDeliveryDuration)

            await this.productMerchantModel.updateMany(
                {
                    masterProductSku: product.masterProduct.sku,
                    productUrl: {
                        $regex: /kaspi/i,
                    },
                },
                { isFullOffersParse }
            )
            return { success: true, message: isFullOffersParse }
        } catch (error) {
            // console.error(`An error occurred: ${error.message}`);
            console.log('[^]' + ' product.service ' + ' | ' + new Date() + ' | ' + 'An error occurred' + ' | ' + '\n' + error)
            return { success: false, error: error.message }
        }
    }

    public async changeManyProductDeliveryDuration(storeId: string, productSku: string[], updatedDeliveryDurations: string[]) {
        for (const sku of productSku) {
            let response: any
            if (updatedDeliveryDurations[0] == ProductDeliveryDurationEnum.ALL) {
                response = await this.deleteProductDeliveryDuration(storeId, sku)
            } else {
                response = await this.changeProductDeliveryDuration(storeId, sku, updatedDeliveryDurations)
            }
            if (!response.success) {
                return { success: false, error: 'Произошла ошибка во время массового обновления доставок!' }
            }
        }
        return { success: true, message: 'Доставки успешно обновлены!' }
    }

    private hasBonusChanges(dto: any): boolean {
        return dto.bonus !== undefined || 
               dto.minBonus !== undefined || 
               dto.maxBonus !== undefined || 
               dto.isBonusDemping !== undefined
    }

    async saveBonusChangeHistory(
        productId: string, 
        storeId: string, 
        sku: string, 
        storeName: string,
        oldBonus?: number, 
        newBonus?: number,
        oldMinBonus?: number,
        newMinBonus?: number,
        oldMaxBonus?: number, 
        newMaxBonus?: number,
        oldIsBonusDemping?: boolean, 
        newIsBonusDemping?: boolean,
        changeMethod: 'MANUAL' | 'AUTO' | 'API' = 'MANUAL',
        changedBy?: string
    ) {
        const changes = []

        // Отслеживаем изменение основного бонуса
        if (typeof oldBonus === 'number' && typeof newBonus === 'number' && oldBonus !== newBonus) {
            changes.push({
                sku,
                productId: new Types.ObjectId(productId),
                storeId: new Types.ObjectId(storeId),
                storeName,
                changeType: 'bonus' as const,
                oldBonusValue: oldBonus,
                newBonusValue: newBonus,
                oldBooleanValue: null,
                newBooleanValue: null,
                changeDate: new Date(),
                changeMethod,
                changedBy
            })
        }

        // Отслеживаем изменение минимального бонуса
        if (typeof oldMinBonus === 'number' && typeof newMinBonus === 'number' && oldMinBonus !== newMinBonus) {
            changes.push({
                sku,
                productId: new Types.ObjectId(productId),
                storeId: new Types.ObjectId(storeId),
                storeName,
                changeType: 'minBonus' as const,
                oldBonusValue: oldMinBonus,
                newBonusValue: newMinBonus,
                oldBooleanValue: null,
                newBooleanValue: null,
                changeDate: new Date(),
                changeMethod,
                changedBy
            })
        }

        // Отслеживаем изменение максимального бонуса
        if (typeof oldMaxBonus === 'number' && typeof newMaxBonus === 'number' && oldMaxBonus !== newMaxBonus) {
            changes.push({
                sku,
                productId: new Types.ObjectId(productId),
                storeId: new Types.ObjectId(storeId),
                storeName,
                changeType: 'maxBonus' as const,
                oldBonusValue: oldMaxBonus,
                newBonusValue: newMaxBonus,
                oldBooleanValue: null,
                newBooleanValue: null,
                changeDate: new Date(),
                changeMethod,
                changedBy
            })
        }

        // Отслеживаем изменение бонусного демпинга
        if (typeof oldIsBonusDemping === 'boolean' && typeof newIsBonusDemping === 'boolean' && oldIsBonusDemping !== newIsBonusDemping) {
            changes.push({
                sku,
                productId: new Types.ObjectId(productId),
                storeId: new Types.ObjectId(storeId),
                storeName,
                changeType: 'isBonusDemping' as const,
                oldBonusValue: null,
                newBonusValue: null,
                oldBooleanValue: oldIsBonusDemping,
                newBooleanValue: newIsBonusDemping,
                changeDate: new Date(),
                changeMethod,
                changedBy
            })
        }

        // Сохраняем все изменения
        if (changes.length > 0) {
            try {
                await this.bonusChangeModel.insertMany(changes)
                console.log(`[ > ] BONUS CHANGES SAVED | ${sku} | ${storeName} | ${changes.length} changes | ${new Date()}`)
            } catch (error) {
                console.error(`[ ! ] ERROR SAVING BONUS CHANGES | ${sku} | ${storeName} | ${new Date()}\n${error}`)
            }
        }
    }

    async getBonusChangeHistory(productId: string, limit: number = 50, page: number = 1) {
        if (!isValidObjectId(productId)) {
            throw new NotFoundException(PRODUCT_NOT_FOUND_ERROR)
        }

        const skip = (page - 1) * limit

        const changes = await this.bonusChangeModel
            .find({ productId: new Types.ObjectId(productId) })
            .sort({ changeDate: -1 })
            .skip(skip)
            .limit(limit)

        const total = await this.bonusChangeModel.countDocuments({ productId: new Types.ObjectId(productId) })

        return {
            data: changes,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        }
    }

    async updateGoldLinkStatus(storeId: string, productId: string, isLinked: boolean) {
        if (!isValidObjectId(storeId) || !isValidObjectId(productId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const result = await this.goldLinkedProductModel.findOneAndUpdate(
            { storeId: new Types.ObjectId(storeId), productId: new Types.ObjectId(productId) },
            { isLinked, updatedAt: new Date() },
            { upsert: true, new: true }
        )

        console.log(`[ > ] GOLD LINK STATUS UPDATED | Store: ${storeId} | Product: ${productId} | isLinked: ${isLinked} | ${new Date()}`)

        return result
    }

    async deleteGoldLinkStatus(storeId: string, productId: string) {
        if (!isValidObjectId(storeId) || !isValidObjectId(productId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const result = await this.goldLinkedProductModel.findOneAndDelete({
            storeId: new Types.ObjectId(storeId),
            productId: new Types.ObjectId(productId),
        })

        console.log(`[ > ] GOLD LINK STATUS DELETED (BACK TO AUTO) | Store: ${storeId} | Product: ${productId} | ${new Date()}`)

        return result
    }

    async getGoldLinkedProductsMap(storeId: string): Promise<Map<string, boolean>> {
        if (!isValidObjectId(storeId)) {
            return new Map()
        }

        const products = await this.goldLinkedProductModel
            .find({ storeId: new Types.ObjectId(storeId) })
            .lean()
            .exec()

        const map = new Map<string, boolean>()
        products.forEach((p) => {
            map.set(p.productId.toString(), p.isLinked)
        })

        return map
    }
}
