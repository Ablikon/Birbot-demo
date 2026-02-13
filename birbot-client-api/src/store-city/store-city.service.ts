import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { StoreService } from 'src/store/store.service'
import { CreateStoreCityDto } from './dto/create-store-city.dto'
import { UpdateStoreCityDto } from './dto/update-store-city.dto'
import { StoreCityModel } from './store-city.model'
import { isValidObjectId, Types } from 'mongoose'
import {
    INVALID_ID_ERROR,
    ITS_SHOULD_BE_NOT_EQUAL_TO_MAIN_CITY_ERROR,
    MAX_STORE_CITY_ERROR,
    STORE_CITY_ALREADY_EXISTS_ERROR,
    STORE_CITY_NOT_FOUND_ERROR,
} from './store-city.constants'
import { INVALID_CITY_ID_ERROR, STORE_NOT_FOUND_ERROR } from 'src/store/store.constants'
import { ProductCityModel } from './product-city.model'
import { ProductService } from 'src/product/product.service'
import { UpdateProductCityDto } from './dto/update-product-city.dto'
import { PROXY_NOT_FOUND_ERROR } from 'src/proxy/proxy.constants'
import { UpdateProductCitiesDto } from './dto/update-product-cities.dto'
import { ProductModel } from 'src/product/product.model'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { createClient } from 'redis'
import { StoreModel } from 'src/store/store.model'
import { PrivilegedStoreService } from 'src/privileged-store/privileged-store.service'

@Injectable()
export class StoreCityService {
    private readonly redisClient = createClient({
        url: process.env.REDIS_URL || '',
    })
    private readonly techRedisClient = createClient({
        url: process.env.TECH_REDIS_URL || '',
    })
    constructor(
        @InjectModel(ProductModel)
        private readonly productModel: ModelType<ProductModel>,
        @InjectModel(StoreCityModel)
        private readonly storeCityModel: ModelType<StoreCityModel>,
        @InjectModel(ProductCityModel)
        private readonly productCityModel: ModelType<ProductCityModel>,
        @Inject(forwardRef(() => StoreService))
        private readonly storeService: StoreService,
        @Inject(forwardRef(() => ProductService))
        private readonly productService: ProductService,
        private readonly privilegedStoreService: PrivilegedStoreService,
        @InjectQueue('actualize-product-merchants-queue') private readonly actualizeProductMerchantsQueue: Queue,
        @InjectQueue('actualize-product-merchants-for-product-queue') private actualizeProductMerchantsForProductQueue: Queue,
        @InjectQueue('actualize-store-active-products-hash-queue') private readonly actualizeStoreActiveProdutsHashQueue: Queue,
    ) {
        this.redisClient.connect().then(() => {
            console.log(`REDIS IN STORE CITY SERVICE CONNECTED`)
        })
        this.techRedisClient.connect().then(() => {
            console.log("TECH REDIS IN STORE CITY SERVICE CONNECTED")
        })
    }

    async createStoreCity(dto: CreateStoreCityDto) {
        if (!isValidObjectId(dto.storeId)) {
            throw new BadRequestException(INVALID_ID_ERROR)
        }

        const store = await this.storeService.getStoreById(dto.storeId)
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const isPrivilegedStore = await this.privilegedStoreService.isPrivileged(dto.storeId)

        const storeCitiesCount = await this.storeCityModel.count({
            storeId: dto.storeId,
        })
        if (!isPrivilegedStore) {
            if (storeCitiesCount >= store.cityLimit) {
                throw new BadRequestException(MAX_STORE_CITY_ERROR)
            }
        }

        const city = await this.storeService.getCityById(dto.cityId)
        if (!city) {
            throw new BadRequestException(INVALID_CITY_ID_ERROR)
        }

        if (store.mainCity.id === dto.cityId) {
            throw new BadRequestException(ITS_SHOULD_BE_NOT_EQUAL_TO_MAIN_CITY_ERROR)
        }

        const storeCity = await this.storeCityModel.findOne({
            storeId: dto.storeId,
            cityId: dto.cityId,
        })
        if (storeCity) {
            throw new BadRequestException(STORE_CITY_ALREADY_EXISTS_ERROR)
        }

        const newStoreCity = await new this.storeCityModel({
            storeId: dto.storeId,
            cityId: city.id,
            cityName: city.name,
            dempingCityId: city.id,
            isActive: true
        }).save()

        await this.redisClient.del(`storeCities:${dto.storeId}`)

        return newStoreCity
    }

    async updateStoreCityData(storeCityId: string, dto: UpdateStoreCityDto) {
        if (!isValidObjectId(storeCityId)) {
            throw new BadRequestException(INVALID_ID_ERROR)
        }

        const storeCity = await this.storeCityModel.findOne({
            _id: storeCityId,
        })
        if (!storeCity) {
            throw new NotFoundException(STORE_CITY_NOT_FOUND_ERROR)
        }

        const store = await this.storeService.getStoreById(storeCity.storeId.toString())
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const city = await this.storeService.getCityById(dto.cityId)
        if (dto.cityId) {
            if (!city) {
                throw new BadRequestException(INVALID_CITY_ID_ERROR)
            }
        }
        const exist = await this.storeCityModel.findOne(
            {
                storeId: storeCity.storeId,
                cityId: city.id
            }
        )
        if(!exist || exist.isActive === true){
            storeCity.cityId = city?.id || storeCity.cityId
            storeCity.cityName = city?.name || storeCity.cityName
            storeCity.dempingCityId = dto.dempingCityId || storeCity.dempingCityId || storeCity.cityId
    
            await storeCity.save()
            await this.redisClient.del(`storeCities:${dto.storeId}`)
            await this.clearRedisStoresActiveProductsByCityId(store, dto.dempingCityId)
            
            return storeCity;
        }
        else{
            await this.storeCityModel.updateMany(
                { _id: { $in: [exist._id, storeCity._id] } },
                [{ $set: { isActive: { $not: "$isActive" } } }] // aggregation pipeline update
            );
            return exist
        }

    }

    async updateProductCity(productCityId: string, dto: UpdateProductCityDto) {
        if (!isValidObjectId(productCityId)) {
            throw new BadRequestException(INVALID_ID_ERROR)
        }

        const productCity = await this.productCityModel.findOne({
            _id: productCityId,
        })
        if (!productCity) {
            throw new NotFoundException(STORE_CITY_NOT_FOUND_ERROR)
        }

        productCity.availableMinPrice = dto.availableMinPrice
        await productCity.save().catch((e) => {
            console.log('[^]' + ' store-city.sarvice ' + ' | ' + new Date() + ' | ' + '\n'+e);
        })
    }

    async getStoreCities(storeId: string) {
        if (!isValidObjectId(storeId)) {
            throw new BadRequestException(INVALID_ID_ERROR)
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
            })
    }

    async clearRedisStoresActiveProductsByCityId(store: StoreModel, cityId: string) {
        const products = await this.productModel.find({storeId: store._id, isDemping: true, isActive:true},{ "masterProduct.sku": 1 });
        await Promise.all(products.map(async (product) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const key = `productCities:${product._id}:${cityId}`
            await this.techRedisClient.del(key)
            await this.actualizeProductMerchantsForProductQueue
                .add(
                    {
                        storeId: store._id,
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
        await this.actualizeStoreActiveProdutsHashQueue.add(
            {
                storeId: store._id,
            },
            {
                removeOnComplete: true,
                priority: 1,
                removeOnFail: true,
                jobId: `${store._id}`
            }
        )
    }

    async getStoreCity(storeId: string, cityId: string) {
        if (!isValidObjectId(storeId)) {
            throw new BadRequestException(INVALID_ID_ERROR)
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
            })
    }

    async getProductCities(productId: string) {
        if (!isValidObjectId(productId)) {
            throw new BadRequestException(INVALID_ID_ERROR)
        }

        const result = []

        const product = await this.productService.getProductById(productId)

        if (!product) {
            console.log(`PRODUCT ID: ${productId}`)

            throw new NotFoundException(PROXY_NOT_FOUND_ERROR)
        }

        const storeCities = await this.storeCityModel.find({
            storeId: product.storeId,
            isActive: true
        })

        for (const storeCity of storeCities) {

            const productCity = await this.productCityModel.findOne({
                storeCityId: storeCity._id.toString(),
                productId: product._id.toString(),
            })

            // let productCity: ProductModel
            // // создаем ключ в редисе
            // const key = `productCityData:${storeCity._id}:${product._id}`;
            // // ищем это в редисе
            // const redisData = await this.redisClient.get(key);
            // if (redisData) productCity = JSON.parse(redisData);
            // else {
            //     productCity = await this.productCityModel.findOne({
            //         storeCityId: storeCity._id.toString(),
            //         productId: product._id.toString(),
            //     })
            // }

            if (productCity) {
                result.push({
                    _id: productCity._id,
                    cityId: storeCity.cityId,
                    cityName: storeCity.cityName,
                    availableMinPrice: productCity.availableMinPrice,
                    availableMaxPrice: productCity.availableMaxPrice,
                    isDemping: productCity.isDemping,
                })
            } else {
                await new this.productCityModel({
                    storeCityId: storeCity._id,
                    productId: product._id,
                    availableMinPrice: product.availableMinPrice,
                })
                    .save()
                    .then((newProductCity) => {
                        // const key = `productCityData:${newProductCity.storeCityId}:${newProductCity.productId}`;
                        // await this.redisClient.set(key, JSON.stringify(productCity), {
                        //     EX: 2 * 60 * 60
                        // });
                        result.push({
                            _id: newProductCity._id,
                            cityId: storeCity.cityId,
                            cityName: storeCity.cityName,
                            availableMinPrice: newProductCity.availableMinPrice,
                        })
                    })
                    .catch((e) => {
                        console.log('[^]' + ' store-city.sarvice ' + ' | ' + new Date() + ' | ' + '\n'+e);
                    })
            }
        }

        return result
    }

    async getStoreCityByQuery(q: object) {
        return this.storeCityModel.findOne(q)
    }

    async getProductCityByQuery(q: object) {
        return this.productCityModel.findOne(q)
    }

    async updateProductCities(dto: UpdateProductCitiesDto[]) {
        for (const productCity of dto) {
            if (!isValidObjectId(productCity.productCityId)) {
                throw new NotFoundException()
            }

            const foundProductCity = await this.productCityModel.findOne({
                _id: productCity.productCityId,
            })

            if (!foundProductCity) {
                throw new NotFoundException()
            }
            if (productCity.availableMaxPrice < productCity.availableMinPrice) {
                throw new BadRequestException()
            }

            // const key = `productCityData:${foundProductCity.storeCityId}:${foundProductCity.productId}`;

            await this.productCityModel.updateOne(
                {
                    _id: productCity.productCityId,
                },
                {
                    availableMinPrice: productCity.availableMinPrice,
                    availableMaxPrice: productCity.availableMaxPrice,
                    isDemping: productCity.isDemping,
                    ...(productCity.dempingPrice !== undefined && { dempingPrice: productCity.dempingPrice }),
                    ...(productCity.isAutoRaise !== undefined && { isAutoRaise: productCity.isAutoRaise })
                }
            )
            // .then(async () => {
            //     const updatedProductCity = this.productCityModel.findOne({
            //         _id: productCity.productCityId
            //     })
                // await this.redisClient.set(key, JSON.stringify(updatedProductCity), {
                //     EX: 2 * 60 * 60
                // });
            // })


        }
    }

    public async deleteStoreCity(storeCityId: string) {
        if (!isValidObjectId(storeCityId)) {
            throw new NotFoundException()
        }

        // const productsWithCity = await this.productCityModel.find({ storeCityId })
        await this.storeCityModel.deleteOne({ _id: storeCityId })
        await this.productCityModel.deleteMany({ storeCityId })
        // for (const cityProduct of productsWithCity) {
        //     const key = `productCityData:${storeCityId}:${cityProduct.productId}`;
        //     await this.redisClient.del(key)
        // }

    }

    /**
     * Получить все ProductCityModel для всех storeCityId, связанных с этим storeId
     */
    async getAllProductCitiesForStore(storeId: string) {
        if (!isValidObjectId(storeId)) {
            throw new BadRequestException(INVALID_ID_ERROR)
        }
        // Получаем все storeCityId для этого магазина
        const storeCities = await this.storeCityModel.find({ storeId })
        const storeCityIds = storeCities.map(c => c._id)
        // Получаем все ProductCityModel для этих storeCityId
        return this.productCityModel.find({ storeCityId: { $in: storeCityIds } })
    }

    async getProductCitiesByProductIds(productIds: string[]) {
        return this.productCityModel
            .find({
                productId: { $in: productIds },
            })
            .lean();
    }
}
