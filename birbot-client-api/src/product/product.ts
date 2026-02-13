import { BadRequestException, ImATeapotException, Inject, Injectable, NotFoundException, forwardRef } from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import { ProductModel } from './product.model'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { Types, isValidObjectId } from 'mongoose'
import { UpdateProductDto, UpdateProductWarehouseDto } from './dto/update-product.dto'
import { MAX_DEMPING_PRODUCTS_ERROR, MIN_AND_MAX_PRICE_ERROR, PRODUCT_NOT_FOUND_ERROR } from './product.constant'
import { StoreService } from 'src/store/store.service'
import { ProductService } from './product.service'
import { Queue } from 'bull'
import { InjectQueue } from '@nestjs/bull'
import { StoreCityService } from 'src/store-city/store-city.service'
import { StoreModel } from 'src/store/store.model'
import { KaspiProductAvailabilityOnPickupPointModel } from './kaspi-product-availability-on-pickup-point.model'
import { ProductMerchantService } from 'src/product-merchant/product-merchant.service'
import { createClient } from 'redis'
import { ProductMerchantModel } from 'src/product-merchant/product-merchant.model'
import { KASPI_MARKETING_NOT_FOUND } from 'src/kaspi-marketing/kaspi-marketing.constants'
import { KaspiMarketingModel } from 'src/kaspi-marketing/kaspi-marketing.model'
import { KaspiMarketingService } from 'src/kaspi-marketing/kaspi-marketing.service'
import { STORE_NOT_FOUND_ERROR } from 'src/store/store.constants'

@Injectable()
export class Product {
    private readonly techRedisClient = createClient({
        url: process.env.TECH_REDIS_URL || '',
    })

    constructor(
        @InjectModel(ProductModel)
        private readonly productModel: ModelType<ProductModel>,
        @InjectModel(ProductMerchantModel)
        private readonly productMerchantModel: ModelType<ProductMerchantModel>,
        @InjectModel(KaspiMarketingModel)
        private readonly kaspiMarketingModel: ModelType<KaspiMarketingModel>,
        @InjectModel(KaspiProductAvailabilityOnPickupPointModel)
        private readonly kaspiProductAvailabilityOnPickupPointModel: ModelType<KaspiProductAvailabilityOnPickupPointModel>,
        @Inject(forwardRef(() => StoreService))
        private readonly storeService: StoreService,
        @Inject(forwardRef(() => ProductService))
        private readonly productService: ProductService,
        @Inject(forwardRef(() => StoreCityService))
        private readonly storeCityService: StoreCityService,
        @InjectQueue('actualize-product-merchants-for-product-queue') private actualizeProductMerchantsForProductQueue: Queue,
        @InjectQueue('bonus-changer-queue') private bonusChangerQueue: Queue,
        @InjectQueue('dumping-tasks-for-dump-manager-queue') private dempingTasksForPriceChangeManagerQueue: Queue,
        @InjectQueue('demping-tasks-for-price-parser-with-super-high-priority-queue')
        private readonly dempingTasksForPriceParserWithSuperHighPriorityQueue: Queue,
        @InjectQueue('demping-tasks-for-product-changer-queue') private readonly dempingTasksForProductChangerQueue: Queue,
        @InjectQueue('demping-tasks-for-product-changer-manager-queue') private readonly dempingTasksForProductChangerManagerQueue: Queue,
        @InjectQueue('products-with-new-min-price-queue') private productsWithNewMinPriceQueue: Queue,
        @InjectQueue('dumping-tasks-for-price-changer-queue') private readonly dumpingTasksForPriceChangerQueue: Queue,
        @InjectQueue('change-product-price-manually-queue') private changeProductPriceManuallyQueue: Queue,
        @InjectQueue('dumping-tasks-for-manually-price-change-manager-queue') private dumpingTasksForManuallyPriceChangeQueue: Queue,
        
        @InjectQueue('bonus-product-status-changer-queue') private bonusProductStatusChanger: Queue,
        @InjectQueue('loan-period-queue') private loadPeriodQueue: Queue,
        @Inject(forwardRef(() => ProductMerchantService))
        private readonly productMerchantService: ProductMerchantService,
        @Inject(forwardRef(() => KaspiMarketingService))
        private readonly kaspiMarkteingService: KaspiMarketingService
    ) {
        this.techRedisClient.connect().then(() => {
            console.log(`TECH REDIS CONNECTED`)
        })
    }

    async updateProduct(productId: string, dto: UpdateProductDto) {
        if (!isValidObjectId(productId)) {
            throw new NotFoundException(PRODUCT_NOT_FOUND_ERROR)
        }

        const foundProduct = await this.productModel.findOne({ _id: productId })

        if (!foundProduct) {
            throw new NotFoundException(PRODUCT_NOT_FOUND_ERROR)
        }

        const foundProductPrice = foundProduct.price

        const store = await this.storeService.getStoreById(foundProduct.storeId.toString())
        if (!store) {
            throw new BadRequestException(STORE_NOT_FOUND_ERROR)
        }

        console.log(`[ > ] UPDATING PRODUCT | ${foundProduct.sku} | ${store.name} | ${new Date()}`)

        const masterSku = foundProduct.masterProduct.sku
        const cityId = store.mainCity.id

        await this.techRedisClient.del(`activeProductsByMasterSkuAndCityId:${masterSku}:${cityId}`)
        await this.techRedisClient.del(`kaspiProductAvailabilityOnPickupPoints:${productId}`)

        this.validatePrices(foundProduct, dto.availableMinPrice, dto.availableMaxPrice)

        if (dto.isDemping) {
            await this.checkActiveProductsLimit(foundProduct.storeId, [foundProduct._id.toString()])
        }

        const updateQuery = {
            ...dto,
            isAutoRaise: dto.isAutoRaise,
        }

        await this.productModel
            .updateOne(
                {
                    _id: productId,
                },
                updateQuery
            )
            .then(async () => {
                await this.techRedisClient.del(`activeProducts:${masterSku}:${cityId}`)
                await this.techRedisClient.del(`productCities:${foundProduct._id}:${cityId}`)
                
                console.log(`[ > ] PRODUCT UPDATED | ${foundProduct.sku} | ${store.name} | ${new Date()}`)
            })

        // Сохраняем историю изменений бонусов
        try {
            await this.productService.saveBonusChangeHistory(
                productId,
                foundProduct.storeId.toString(),
                foundProduct.sku,
                store.name,
                foundProduct.bonus,
                dto.bonus,
                foundProduct.minBonus,
                dto.minBonus,
                foundProduct.maxBonus,
                dto.maxBonus,
                foundProduct.isBonusDemping,
                dto.isBonusDemping,
                'MANUAL',
                null
            )
        } catch (error) {
            console.error(`[ ! ] ERROR SAVING BONUS CHANGE HISTORY | ${foundProduct.sku} | ${store.name} | ${new Date()}\n${error}`)
        }

       
        if (typeof dto.bonus === 'number' && dto.bonus !== foundProduct.bonus) {
            const kaspiMarketing = await this.kaspiMarketingModel.findOne(
                {
                    storeId: store._id
                }
            )
            if(!kaspiMarketing){
                throw new Error(KASPI_MARKETING_NOT_FOUND)
            }
            try{
                await this.bonusChangerQueue.add(
                    {
                        productId,
                        kaspiMarketingId: kaspiMarketing._id,
                        newBonus: dto.bonus
                    },
                    {
                        removeOnFail: true,
                        removeOnComplete:true,
                    }
                )
                console.log("[ > ] ADDED TO BONUS CHANGER QUEUE", '|', foundProduct.sku, '|', new Date())
            } catch (e) {
                console.log(`[ ! ] ERROR ADDING PRODUCT IN BONUS CHANGER QUEUE ${foundProduct.sku} | ${store.name} | ${new Date()}\n${e}`)
            }
        }
        if (typeof dto.isBonusDemping === 'boolean' && dto.isBonusDemping) {
            try{
                const isDempingAvailable = await this.kaspiMarkteingService.isDempingAvailable(foundProduct.masterProduct.sku, store.mainCity.id)
                // const isDempingAvailable = true
                console.log('isDempingAvailable',isDempingAvailable)
                if(!isDempingAvailable){
                    await this.productModel.updateOne(
                        {
                            _id: foundProduct._id
                        },
                        {
                            isBonusDemping: false
                        }
                    )
                    console.log("IS NOT AVAILABLE")
                    throw new Error('У товара нет единых цен — демпинг по бонусам невозможен')
                }
                const kaspiMarketing = await this.kaspiMarketingModel.findOne(
                    {
                        storeId: store._id
                    }
                )
                if(!kaspiMarketing){
                    throw new Error(KASPI_MARKETING_NOT_FOUND)
                }
                // await this.kaspiMarkteingService.changeProductOnBonusStatus(foundProduct.masterProduct.sku, kaspiMarketing, 'Enabled')
                // if(!foundProduct.isAddedToBonusCampaign)
                //     await this.kaspiMarkteingService.addProductOnBonus(foundProduct.masterProduct.sku, dto.bonus || foundProduct.bonus, kaspiMarketing)
                await this.bonusProductStatusChanger.add(
                    {
                        productId: foundProduct._id.toString(),
                        kaspiMarketingId: kaspiMarketing._id.toString(),
                        status: 'Enabled'
                    },
                    {
                        removeOnFail: true,
                        removeOnComplete: true
                    }
                )
                await this.productModel.updateOne(
                    {
                        _id: productId
                    },
                    {
                        isDemping: false,
                        isAddedToBonusCampaign: true
                    }
                )
            } catch (e) {
                console.log(`[ ! ] ERROR ADDING PRODUCT IN BONUS CHANGER QUEUE ${foundProduct.sku} | ${store.name} | ${new Date()}\n${e}`)
                throw new BadRequestException('У товара нет единых цен — демпинг по бонусам невозможен')
            }
        }
        if (typeof dto.isBonusDemping === 'boolean' && !dto.isBonusDemping) {
            try{
                const kaspiMarketing = await this.kaspiMarketingModel.findOne(
                    {
                        storeId: store._id
                    }
                )
                if(!kaspiMarketing){
                    throw new Error(KASPI_MARKETING_NOT_FOUND)
                }
                await this.productModel.updateOne(
                    {
                        _id: productId
                    },
                    {
                        isDemping: false
                    }
                )
                // await this.kaspiMarkteingService.changeProductOnBonusStatus(foundProduct.masterProduct.sku, kaspiMarketing, 'paused')
                await this.bonusProductStatusChanger.add(
                    {
                        productId: foundProduct._id.toString(),
                        kaspiMarketingId: kaspiMarketing._id.toString(),
                        status: 'paused'
                    },
                    {
                        removeOnFail: true,
                        removeOnComplete: true
                    }
                )
            } catch (e) {
                console.log(`[ ! ] ERROR ADDING PRODUCT IN BONUS CHANGER QUEUE ${foundProduct.sku} | ${store.name} | ${new Date()}\n${e}`)
            }
        }
        if (typeof dto.loanPeriod === 'number' && dto.loanPeriod !== foundProduct.loanPeriod) {
            try {
                await this.loadPeriodQueue.add(
                    { productId: productId },
                    {
                        removeOnComplete: true,
                        removeOnFail: true,
                        priority: 1
                    }
                );
                console.log(`[ > ] ADDED LOAN PERIOD UPDATE IN QUEUE | ${foundProduct.sku} | ${store.name} | ${new Date()}`);
            } catch (e) {
                console.error(`[ ! ] ERROR ADDING LOAN PERIOD UPDATE IN QUEUE ${foundProduct.sku} | ${store.name} | ${new Date()}\n${e}`);
            }
        }


        if(typeof dto.price === 'number' && dto.price !== foundProductPrice) {
            const storeCities = await this.storeCityService.getStoreCities(store._id.toString())
            try {
                const jobData = await this.getJobData(dto.cityId, foundProduct, storeCities, store, dto);

                await this.dumpingTasksForManuallyPriceChangeQueue.add(
                    jobData,
                    {
                        removeOnComplete: true,
                        removeOnFail: true,
                        priority: 1
                    }
                )
                console.log(`[ > ] ADDED NEW MANUAL PRICE CHANGE IN QUEUE | ${foundProduct.sku} | ${store.name} | ${new Date()}`)
            } catch (e) {
                console.error(`[ ! ] ERROR ADDING MANUAL PRICE CHANGE IN QUEUE ${foundProduct.sku} | ${store.name} | ${new Date()}\n${e}`);
            }
        }

        const currentMinPrice = foundProduct.availableMinPrice

        if (typeof dto.availableMinPrice === 'number' && currentMinPrice !== dto.availableMinPrice) {
            this.productsWithNewMinPriceQueue.add(
                { productId: productId, storeId: store._id.toString() },
                {
                    removeOnComplete: true,
                    removeOnFail: true,
                    priority: 1,
                }
            )
        }

        const minDifferentFromThanCurrentPrice =
            foundProduct.isActive && typeof dto.availableMinPrice === 'number' && foundProduct.availableMinPrice !== dto.availableMinPrice

        await this.actualizeProductAvailabilitiesOnPickupPoints(store, foundProduct, dto.productWarehouses).catch((e) => {
            console.error(`[ ! ] ERROR UPDATING PRODUCT AVAILABILITIES | ${foundProduct.sku} | ${store.name} | ${new Date}\n${e}`);
        })

        if (minDifferentFromThanCurrentPrice || (dto.dempingPrice !== foundProduct.dempingPrice && foundProduct.place !== 1)) {
            try {
                const productMerchant = await this.productMerchantService.getProductMerchant(
                    foundProduct.masterProduct.sku,
                    store.mainCity.id
                )

                this.techRedisClient.del(`activeProducts:${foundProduct.masterProduct.sku}:${productMerchant.cityId}`)
                await this.productMerchantModel.updateOne(
                    {
                        masterProductSku: foundProduct.masterProduct.sku,
                        cityId: productMerchant.cityId
                    },
                    {
                        $set: {
                            updatePeriod: 1,
                            "_nextUpdateDate": 0
                        }
                    }
                )

                if (productMerchant) {
                    this.dempingTasksForPriceParserWithSuperHighPriorityQueue
                        .add(
                            {
                                _id: productMerchant._id,
                                masterProductSku: productMerchant.masterProductSku,
                                cityId: productMerchant.cityId,
                                updatePeriod: 1,
                                productUrl: productMerchant.productUrl,
                                isX2Check: productMerchant.isX2Check,
                            },
                            {
                                removeOnComplete: true,
                                removeOnFail: true,
                                attempts: 20,
                                priority: 1,
                            }
                        )
                        .catch((e) => {
                            console.error(`[ ! ] ERROR ADDING PRODUCT DEMPING IN QUEUE ${foundProduct.sku} | ${store.name} | ${new Date()}\n${e}`);
                        })
                }
            } catch (e) {
                console.error(`[ ! ] ERROR ADDING PRODUCT DEMPING IN QUEUE ${foundProduct.sku} | ${store.name} | ${new Date()}\n${e}`);
            }
        }
        if (foundProduct.isActive && foundProduct.isDemping !== dto.isDemping) {
            await this.actualizeProductMerchantsForProductQueue
                .add(
                    {
                        storeId: foundProduct.storeId,
                        masterProductSku: foundProduct.masterProduct.sku,
                        mainCity: store.mainCity,
                        productUrl: foundProduct.url,
                    },
                    {
                        removeOnComplete: true,
                        removeOnFail: false,
                        // jobId: `${foundProduct._id}`,
                        priority: 1,
                    }
                )
                .catch((e) => {
                    console.error(`[ ! ] ERROR ADDING PRODUCT ACTUALIZING IN QUEUE ${foundProduct.sku} | ${store.name} | ${new Date()}\n${e}`);
                })
        }
        const key = `requestLimitExceeded:${store.storeId}`;
        const data = await this.techRedisClient.get(key);

        if (data) {
            const parsedData = JSON.parse(data);

            return parsedData
        }
        return
    }

    async getJobData(cityId: string, product: any, storeCities: any, store: any, dto: any){
        const selectedCity = product.cityPrices.find(data => data.cityId === dto.cityId)
        const priceChange = [{
            newPrice: dto.price,
            oldPrice: product.price,
            cityId: cityId,
        }];
        return  {
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
        }
    }

    async actualizeProductAvailabilitiesOnPickupPoints(
        store: StoreModel,
        product: ProductModel,
        productAvailabilityOnPickupPoints: UpdateProductWarehouseDto[]
    ) {
        if (!Array.isArray(productAvailabilityOnPickupPoints)) {
            console.error("productAvailabilityOnPickupPoints is not an array");
            return;
        }

        const storePickupPoints = await this.storeService.getStorePickupPoints(store._id.toString())

        await Promise.all(
            productAvailabilityOnPickupPoints.map(async (productAvailabilityOnPickupPoint) => {
                const storePickupPoint = storePickupPoints.find(
                    (v) => v._id.toString() === productAvailabilityOnPickupPoint.storePickupPointId.toString()
                )
                if (!storePickupPoint) {
                    return
                } else if (storePickupPoint.storeId.toString() !== product.storeId.toString()) {
                    return
                }

                // создаем key для обновления в редисе
                const storePickupPointId = storePickupPoint._id;
                const productId = product._id;
                // Тут мы берем ключ по товару для обновления отсортированного сэта
                const collectionKey = `kaspiProductAvailabilityOnPickupPoints:${productId}`;

                const exists = await this.kaspiProductAvailabilityOnPickupPointModel.exists({
                    storePickupPointId,
                    productId,
                })

                if (exists) {
                    await this.kaspiProductAvailabilityOnPickupPointModel.updateOne(
                        {
                            storePickupPointId,
                            productId,
                        },
                        {
                            amount: productAvailabilityOnPickupPoint.amount,
                            preOrder: productAvailabilityOnPickupPoint.preOrder,
                            available: productAvailabilityOnPickupPoint.available,
                        }
                    );

                    // Обновляем редис
                    const collectionData = await this.kaspiProductAvailabilityOnPickupPointModel.find({ productId })
                    await this.techRedisClient.del(collectionKey);
                    for (const item of collectionData) {
                        await this.techRedisClient.zAdd(collectionKey, { score: 0, value: JSON.stringify(item) });
                    }
                    await this.techRedisClient.expire(collectionKey, 2 * 60 * 60);

                } else {
                    // Создаем в базе
                    await new this.kaspiProductAvailabilityOnPickupPointModel({
                        storePickupPointId,
                        productId,
                        amount: productAvailabilityOnPickupPoint.amount,
                        preOrder: productAvailabilityOnPickupPoint.preOrder,
                        available: productAvailabilityOnPickupPoint.available,
                    }).save();


                    //создаем в редисе
                    const collectionData = await this.kaspiProductAvailabilityOnPickupPointModel.find({ productId })
                    await this.techRedisClient.del(collectionKey);
                    for (const item of collectionData) {
                        await this.techRedisClient.zAdd(collectionKey, { score: 0, value: JSON.stringify(item) });
                    }
                    await this.techRedisClient.expire(collectionKey, 2 * 60 * 60);
                }
            }))

        if (product.isActive && store.expireDate > new Date()) {
            const foundProduct = await this.productModel.findOne({ _id: product._id })
            if (!foundProduct) {
                return
            }

            await this.addJobToQueueForProductChanger(store, foundProduct)
        }
    }

    private validatePrices(product: ProductModel, minPrice?: number, maxPrice?: number) {
        if (maxPrice && minPrice) {
            if (maxPrice < minPrice) {
                throw new BadRequestException(MIN_AND_MAX_PRICE_ERROR)
            }
        } else if (maxPrice) {
            if (maxPrice < product.availableMinPrice) {
                throw new BadRequestException(MIN_AND_MAX_PRICE_ERROR)
            }
        } else if (minPrice) {
            if (minPrice > product.availableMaxPrice) {
                throw new BadRequestException(MIN_AND_MAX_PRICE_ERROR)
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
}
