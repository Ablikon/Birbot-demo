import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { path } from 'app-root-path'
import * as path2 from 'path';          // Node's path module
import { format } from 'date-fns'
import { ProductService } from 'src/product/product.service'
import { StoreService } from 'src/store/store.service'
import { Types, isValidObjectId } from 'mongoose'
import { STORE_NOT_FOUND_ERROR } from 'src/store/store.constants'
import { ensureDir, writeFile } from 'fs-extra'
import { InjectModel } from 'nestjs-typegoose'
import { PriceListModel } from './price-list.model'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { INVALID_FORMAT_FILE_ERROR } from './warehouse.constants'
import { StoreCityService } from 'src/store-city/store-city.service'
import { toJson } from 'xml2json'
import { readFileSync, writeFileSync } from 'fs'
import { parse } from 'node-xlsx'
import { PriceListExampleModel } from './price-list-example.mode'
import { ProductItemPriceDto } from './dto/product-item-price.dto'
import { ProductItemPriceCityDto } from './dto/product-item-price-city.dto'
import { UpdateProductDto } from 'src/product/dto/update-product.dto'
import { UpdateProductCitiesDto } from 'src/store-city/dto/update-product-cities.dto'
import { Product } from 'src/product/product'
import { StoreModel } from 'src/store/store.model'
import { StorePriceListUploadModel } from './store-price-list-upload.model'
import { InjectQueue } from '@nestjs/bull'
import { Queue } from 'bull'
import { StorePriceListProductUpdateHistoryModel } from './store-price-list-product-update-history.model'
import { KaspiProductAvailabilityOnPickupPointModel } from 'src/product/kaspi-product-availability-on-pickup-point.model'
import { KaspiStorePickupPointModel } from 'src/store/kaspi-store-pickup-point.model'
import { isNumber, isNumberString, isString } from 'class-validator'
import { createClient } from 'redis'

export type KaspiXmlOfferPriceType = {
    cityId?: string
    price: number
}

export type KaspiXmlOfferAvailabilityType = {
    available: boolean
    storeId: string
    preOrder: number
    stock?: number
}

export type KaspiXmlOfferCityType = {
    cityId: string,
    availableMinPrice?: number,
	availableMaxPrice?: number,
	price?: number,
}

export type KaspiXmlOfferType = {
    model: string
    brand: string
    availabilities: KaspiXmlOfferAvailabilityType[]
    prices: KaspiXmlOfferPriceType[]
    sku: string
}

export type KaspiXmlType = {
    company: string
    merchantId: string
    offers: KaspiXmlOfferType[]
}

export type KaspiExternalXmlOfferType = {
    model: string
    brand: string
    availabilities: KaspiXmlOfferAvailabilityType[]
    prices: KaspiXmlOfferPriceType[]
    minPrices?: KaspiXmlOfferPriceType[]
    maxPrices?: KaspiXmlOfferPriceType[]
    cities?: KaspiXmlOfferCityType[]
    isSetMinPrice?: number
    archiveProtection?: number
    autoacceptOrders?: number
    sku: string
    availableMinPrice?: number
    availableMaxPrice?: number
    purchasePrice?: number
    isDemping?: number
    isAutoRaise?: number
    step?: number
    withdrawIfEmptyStock?: number
}

export type KaspiExternalXmlType = {
    company: string
    merchantId: string
    offers: KaspiExternalXmlOfferType[]
}


@Injectable()
export class WarehouseService {
    private readonly techRedisClient = createClient({
        url: process.env.TECH_REDIS_URL || '',
    })
    constructor(
        @InjectModel(StorePriceListUploadModel)
        private readonly storePriceListUploadModel: ModelType<StorePriceListUploadModel>,
        @InjectModel(PriceListExampleModel)
        private readonly priceListExampleModel: ModelType<PriceListExampleModel>,
        @InjectModel(StorePriceListProductUpdateHistoryModel)
        private readonly storePriceListProductUpdateHistoryModel: ModelType<StorePriceListProductUpdateHistoryModel>,
        @InjectModel(KaspiProductAvailabilityOnPickupPointModel)
        private readonly kaspiProductAvailabilityOnPickupPointModel: ModelType<KaspiProductAvailabilityOnPickupPointModel>,
        @InjectModel(KaspiStorePickupPointModel)
        private readonly KaspiStorePickupPointModel: ModelType<KaspiStorePickupPointModel>,
        @InjectModel(StoreModel) private readonly storeModel: ModelType<StoreModel>,
        private readonly productService: ProductService,
        private readonly product: Product,
        private readonly storeService: StoreService,
        private readonly storeCityService: StoreCityService,
        @InjectQueue('update-product-from-price-list-queue') private readonly updateProductFromPriceListQueue: Queue,
        @InjectQueue('load-specific-kaspi-product-queue') private readonly loadSpecificKaspiProductQueue: Queue,
        @InjectQueue('actualize-product-availabilites-and-settings-from-external-xml-queue') private readonly actualizeProductAvailabilitiesAndSettingsFromExternalXmlQueue: Queue
    ) {
        this.techRedisClient.connect().then(() => {
            console.log(`TECH REDIS CONNECTED`)
        })
    }
    private parseAvailability(availability: any): KaspiXmlOfferAvailabilityType {
        return {
            available: availability.available === 'yes',
            storeId: availability.storeId,
            preOrder: parseInt(availability.preOrder || '0'),
            stock: availability.stockCount ? parseInt(availability.stockCount) : undefined
        }
    }

    private parseCity(city: any): KaspiXmlOfferCityType {
        return {
            cityId: city.cityId,
            availableMinPrice: city.availableMinPrice ? parseInt(city.availableMinPrice) : undefined,
            availableMaxPrice: city.availableMaxPrice ? parseInt(city.availableMaxPrice) : undefined,
            price: city.price ? parseInt(city.price) : undefined
        }
    }

    private async parseKaspiXmlToJson(data: string): Promise<KaspiExternalXmlType> {
        const jsonString: string = toJson(data)
        if (!jsonString) {
            throw new Error('Error occurred on parse xml')
        }

        const jsonData = JSON.parse(jsonString)

        const company = jsonData.kaspi_catalog.company
        const merchantId = jsonData.kaspi_catalog.merchantid

        if (!isString(company) || !isString(merchantId)) {
            throw new Error('Not found company or merchantid')
        }

        const offers = jsonData.kaspi_catalog.offers.offer || []
        const kaspiOffers: KaspiExternalXmlOfferType[] = []

        console.log(`offers count for ${company}: ${offers?.length}`)

        await Promise.all(offers.map((offer: any) => {
            const kaspiAvailabilities: KaspiXmlOfferAvailabilityType[] = []

            const availabilities = offer.availabilities.availability
            if (Array.isArray(availabilities)) {
                for (const availability of availabilities) {
                    kaspiAvailabilities.push(this.parseAvailability(availability))
                }
            } else {
                kaspiAvailabilities.push(this.parseAvailability(availabilities))
            }

            const kaspiCities: KaspiXmlOfferCityType[] = []

            const cities = offer?.cities?.city
            if (Array.isArray(cities)) {
                for (const city of cities) {
                    kaspiCities.push(this.parseCity(city))
                }
            } else if (cities) {
                kaspiCities.push(this.parseCity(cities))
            }

            const kaspiPrices: KaspiXmlOfferPriceType[] = []

            // Обрабатываем простую цену (price)
            if (isNumberString(offer.price) || isNumber(offer.price)) {
                kaspiPrices.push({
                    price: parseInt(`${offer.price}`),
                })
            }

            // Обрабатываем цены по городам (cityprices)
            const cityprices = offer?.cityprices?.cityprice
            if (cityprices) {
                if (Array.isArray(cityprices)) {
                    for (const cityprice of cityprices) {
                        // Проверяем, что это объект с атрибутами
                        if (cityprice && typeof cityprice === 'object' && cityprice.cityId && cityprice.$t) {
                            kaspiPrices.push({
                                cityId: cityprice.cityId,
                                price: parseInt(`${cityprice.$t}`)
                            })
                        }
                    }
                } else {
                    // Один элемент cityprice
                    if (cityprices && typeof cityprices === 'object' && cityprices.cityId && cityprices.$t) {
                        kaspiPrices.push({
                            cityId: cityprices.cityId,
                            price: parseInt(`${cityprices.$t}`)
                        })
                    }
                }
            }

            const kaspiMinPrices: KaspiXmlOfferPriceType[] = []
            if (isNumberString(offer.minprice) || isNumber(offer.minprice)) {
                kaspiMinPrices.push({
                    price: parseInt(`${offer.minprice}`),
                })
            }

            const kaspiMaxPrices: KaspiXmlOfferPriceType[] = []
            if (isNumberString(offer.maxprice) || isNumber(offer.maxprice)) {
                kaspiMaxPrices.push({
                    price: parseInt(`${offer.maxprice}`),
                })
            }

            kaspiOffers.push({
                model: offer.model,
                brand: offer.brand,
                availabilities: kaspiAvailabilities,
                prices: kaspiPrices,
                minPrices: kaspiMinPrices,
                maxPrices: kaspiMaxPrices,
                cities: kaspiCities,
                isSetMinPrice: offer.isSetMinPrice ? parseInt(offer.isSetMinPrice) : undefined,
                archiveProtection: offer.archiveProtection ? parseInt(offer.archiveProtection) : undefined,
                autoacceptOrders: offer.autoacceptOrders ? parseInt(offer.autoacceptOrders) : undefined,
                sku: offer.sku,
                availableMinPrice: offer.availableMinPrice ? parseInt(offer.availableMinPrice) : undefined,
                availableMaxPrice: offer.availableMaxPrice ? parseInt(offer.availableMaxPrice) : undefined,
                purchasePrice: offer.purchasePrice ? parseInt(offer.purchasePrice) : undefined,
                isDemping: offer.isDemping ? parseInt(offer.isDemping) : undefined,
                isAutoRaise: offer.isAutoRaise ? parseInt(offer.isAutoRaise) : undefined,
                step: offer.step ? parseInt(offer.step) : undefined,
                withdrawIfEmptyStock: offer.withdrawIfEmptyStock ? parseInt(offer.withdrawIfEmptyStock) : undefined
            })
        }))

        return {
            company,
            merchantId,
            offers: kaspiOffers
        }
    }

    async uploadPriceList(file: Express.Multer.File, storeId: string) {
        if (!file) {
            throw new BadRequestException()
        }

        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }
        const store = await this.storeService.getStoreById(storeId)
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const dateFolder = format(new Date(), 'dd-MM-yyyy')
        
        const uploadFolder = path2.join(path, 'uploads', 'price-lists', 'kaspi',`${store.name.replace(/[<>:"/\\|?*]/g, "_")}-${dateFolder}`);
        // const uploadFolder = `${path2}/uploads/price-lists/kaspi/${store.name}-${dateFolder}`
        // Обеспечиваем путь до файла
        await ensureDir(uploadFolder)

        // Сохраняем файл
        await writeFile(`${uploadFolder}/${file.originalname}`, file.buffer)

        const fullPath = `${uploadFolder}/${file.originalname}`
        
        const isXmlExtension = file.originalname.toLowerCase().endsWith('.xml');
        const isXmlMime = file.mimetype === 'text/xml' || file.mimetype === 'application/xml';
        if(isXmlExtension && isXmlMime){
            const xmlString = file.buffer.toString('utf8');
            // console.log(xmlString)
            const offers = await this.parseKaspiXmlToJson(xmlString)
            console.log(offers.offers.length)
            await Promise.all(offers.offers.map( async (offer: KaspiExternalXmlOfferType) => {
                const jobId = `${storeId.toString()}_${offer.sku}`
                await this.loadSpecificKaspiProductQueue.add(
                    {
                        storeId: storeId.toString(),
                        sku: offer.sku,
                    },
                    {
                        removeOnComplete: true,
                        removeOnFail: true,
                        priority: 1,
                        attempts: 5,
                        jobId,
                    }
                )
                const product = await this.productService.getProductBySku(offer.sku)
                if(product){
                    await this.actualizeProductAvailabilitiesAndSettingsFromExternalXmlQueue.add(
                        {
                            storeId,
                            productId: product._id,
                            offer
                        },
                        {
                            removeOnFail: true,
                            removeOnComplete: true,
                            attempts: 3,
                            priority: 1
                        }
                    )
                }
            }))

            const newStorePriceListUpload = await new this.storePriceListUploadModel({
                storeId,
                originalFileName: file.originalname,
                distinctOffersCount: offers.offers.length,
            }).save()
            
            return {
                id: newStorePriceListUpload._id,
            }
            
        }

        const products = await this.readDataFromExcelFile(store, fullPath)

        const newStorePriceListUpload = await new this.storePriceListUploadModel({
            storeId,
            originalFileName: file.originalname,
            distinctOffersCount: products.length,
        }).save()

        for (const product of products) {
            this.updateProductFromPriceListQueue.add(
                {
                    storeId,
                    storePriceListUploadId: newStorePriceListUpload._id,
                    product,
                },
                {
                    removeOnComplete: true,
                    removeOnFail: true,
                    priority: 3,
                }
            )
        }

        return {
            id: newStorePriceListUpload._id,
        }
    }

    async updateProducts(products: ProductItemPriceDto[], storeId: string) {
        let i = 0

        for (const product of products) {
            try {
                i++
                const foundProduct = await this.productService.getProductByQuery({
                    sku: product.sku,
                    storeId,
                })

                if (!foundProduct) {
                    console.log(`PRODUCT NOT FOUND | ${product.sku} | ${storeId}`)
                    continue
                }

                const mainCity = product.cities.find((v) => v.isMain)

                const updateProductDto = new UpdateProductDto()
                if (product.isDemping !== undefined) updateProductDto.isDemping = product.isDemping
                if (product.dempingPrice !== undefined) updateProductDto.dempingPrice = product.dempingPrice
                if (product.purchasePrice !== undefined) updateProductDto.purchasePrice = product.purchasePrice
                if (mainCity) {
                    updateProductDto.availableMinPrice = mainCity.availableMinPrice
                    updateProductDto.availableMaxPrice = mainCity.availableMaxPrice
                    updateProductDto.amount = mainCity.amount
                }

                const productCities = await this.storeCityService.getProductCities(foundProduct._id.toString())
                const otherCities = product.cities.filter((v) => !v.isMain)
                const updateProductCities: UpdateProductCitiesDto[] = []
                for (const productCity of productCities) {
                    const foundCity = otherCities.find((v) => v.cityId === productCity.cityId)

                    if (foundCity) {
                        const newUpdateProductCity = new UpdateProductCitiesDto()
                        newUpdateProductCity.productCityId = productCity._id
                        newUpdateProductCity.availableMinPrice = foundCity.availableMinPrice
                        newUpdateProductCity.availableMaxPrice = foundCity.availableMaxPrice

                        updateProductCities.push(newUpdateProductCity)
                    }
                }

                await this.storeCityService.updateProductCities(updateProductCities)

                try {
                    await this.product.updateProduct(foundProduct._id.toString(), updateProductDto)
                } catch (e) {}
            } catch (e) {
                console.log('[^]' + ' warehouse.sarvice ' + ' | ' + new Date() + ' | ' + '\n'+e);
            }
        }

        console.log('UPLOAD PRICE LIST ENDED')
    }

    async getExample(storeId: string) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }
        const store = await this.storeService.getStoreById(storeId)
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const excel = require('excel4node')
        const workbook = new excel.Workbook()
        const worksheet = workbook.addWorksheet('Sheet 1')

        worksheet.cell(1, 1).string('Магазин')
        worksheet.cell(1, 2).string('Название')
        worksheet.cell(1, 3).string('SKU')
        worksheet.cell(1, 4).string('Опубликовано')
        worksheet.cell(1, 5).string('Город')
        worksheet.cell(1, 6).string('Цена')
        worksheet.cell(1, 7).string('Минимум')
        worksheet.cell(1, 8).string('Максимум')
        worksheet.cell(1, 9).string('Остаток')
        worksheet.cell(1, 10).string('Предзаказ')
        worksheet.cell(1, 11).string('Включить автоснижение цены')
        worksheet.cell(1, 12).string('Шаг снижения цены')
        worksheet.cell(1, 13).string('Закупочная цена, тг')

        const products = await this.productService.getAllProductsByStoreId(storeId)
        const storeCities = await this.storeCityService.getStoreCities(storeId)
        let row = 2 // Start from row 2 after header

        for (const product of products) {
            // Главный город
            const mainWarehouse = await this.KaspiStorePickupPointModel.findOne({
                cityId: store.mainCity.id, 
                storeId: storeId, 
                status: 'ACTIVE'
            })
            const mainCityAvailability = await this.kaspiProductAvailabilityOnPickupPointModel.findOne({ 
                productId: product._id, 
                storePickupPointId: mainWarehouse?._id, 
                available: true 
            }).sort({updatedAt: -1})

            worksheet.cell(row, 1).string(store.name)
            worksheet.cell(row, 2).string(product.name)
            worksheet.cell(row, 3).string(product.sku)
            worksheet.cell(row, 4).string(product.isActive ? 'да' : 'нет')
            worksheet.cell(row, 5).string(store.mainCity.name)
            worksheet.cell(row, 6).number(product.price || 0)
            worksheet.cell(row, 7).number(product.availableMinPrice || 0)
            worksheet.cell(row, 8).number(product.availableMaxPrice || 999999999)
            worksheet.cell(row, 9).number(mainCityAvailability?.amount || 0)
            worksheet.cell(row, 10).number(mainCityAvailability?.preOrder || 0)
            worksheet.cell(row, 11).string(product.isDemping ? 'да' : 'нет')
            worksheet.cell(row, 12).string(product.dempingPrice ? product.dempingPrice.toString() : '')
            worksheet.cell(row, 13).string(product.purchasePrice ? product.purchasePrice.toString() : '')
            row++

            for (const storeCity of storeCities) {
                const productInCity = await this.storeCityService.getProductCityByQuery({
                    productId: product._id,
                    storeCityId: storeCity._id
                })

                const warehouse = await this.KaspiStorePickupPointModel.findOne({
                    cityId: storeCity.cityId, 
                    storeId: storeId, 
                    status: 'ACTIVE'
                })
                const cityAvailability = await this.kaspiProductAvailabilityOnPickupPointModel.findOne({ 
                    productId: product._id, 
                    storePickupPointId: warehouse?._id, 
                    available: true 
                }).sort({updatedAt: -1})

                const minPrice = productInCity?.availableMinPrice || product.availableMinPrice
                const maxPrice = productInCity?.availableMaxPrice || product.availableMaxPrice

                worksheet.cell(row, 1).string(store.name)
                worksheet.cell(row, 2).string(product.name)
                worksheet.cell(row, 3).string(product.sku)
                worksheet.cell(row, 4).string(product.isActive ? 'да' : 'нет')
                worksheet.cell(row, 5).string(storeCity.cityName)
                worksheet.cell(row, 6).number(product.price || 0)
                worksheet.cell(row, 7).number(minPrice || 0)
                worksheet.cell(row, 8).number(maxPrice || 999999999)
                worksheet.cell(row, 9).number(cityAvailability?.amount || 0)
                worksheet.cell(row, 10).number(cityAvailability?.preOrder || 0)
                worksheet.cell(row, 11).string(product.isDemping ? 'да' : 'нет')
                worksheet.cell(row, 12).string(product.dempingPrice ? product.dempingPrice.toString() : '')
                worksheet.cell(row, 13).string(product.purchasePrice ? product.purchasePrice.toString() : '')
                row++
            }
        }

        const dateName = format(new Date(), 'dd.MM.yyyy HH:mm:ss')
        const uploadFolder = `${path}/uploads/examples/price-list-kaspi/${store.name}`

        await ensureDir(uploadFolder)

        const fullPath = `${uploadFolder}/${dateName}.xlsx`

        await workbook.write(fullPath)

        await this.sleep(1000)

        return fullPath
    }

    async sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    async generateExample(storeId: string, dto: {isActive?: boolean, isDemping?: boolean}) {
        try {
            if (!isValidObjectId(storeId)) {
                throw new NotFoundException(STORE_NOT_FOUND_ERROR)
            }
            const store = await this.storeService.getStoreById(storeId)
            if (!store) {
                throw new NotFoundException(STORE_NOT_FOUND_ERROR)
            }

            console.log(`[generateExample] Starting for store: ${store.name}`);

             const BATCH_SIZE = 250 // Reduced batch size for better memory management
            const storeCities = await this.storeCityService.getStoreCities(storeId)
            const warehouses = await this.KaspiStorePickupPointModel.find({ storeId, status: 'ACTIVE' })

            // Для быстрого доступа к StoreCity по cityId
            const storeCityByCityId = new Map<string, any>()
            storeCities.forEach((sc: any) => {
                storeCityByCityId.set(sc.cityId, sc)
            })

            //EXCEL
            const excel = require('excel4node')
            const workbook = new excel.Workbook()
            const worksheet = workbook.addWorksheet('Sheet 1')

            // Header (как раньше, но вместо "Город" используем "Склад")
            worksheet.cell(1, 1).string('Магазин')
            worksheet.cell(1, 2).string('Название')
            worksheet.cell(1, 3).string('SKU')
            worksheet.cell(1, 4).string('Опубликовано')
            worksheet.cell(1, 5).string('Склад')
            worksheet.cell(1, 6).string('Цена')
            worksheet.cell(1, 7).string('Минимум')
            worksheet.cell(1, 8).string('Максимум')
            worksheet.cell(1, 9).string('Остаток')
            worksheet.cell(1, 10).string('Наличие')
            worksheet.cell(1, 11).string('Предзаказ')
            worksheet.cell(1, 12).string('Включить автоснижение цены')
            worksheet.cell(1, 13).string('Шаг снижения цены')
            worksheet.cell(1, 14).string('Закупочная цена, тг')

            let row = 2;
            let processedCount = 0;
            let hasMoreProducts = true;
            let totalProcessed = 0;

            while (hasMoreProducts) {
                try {
                    console.log(`[generateExample] Processing batch ${processedCount / BATCH_SIZE + 1} for store: ${store.name}`);
                    
                    const products = await this.productService.getFilerProductsByStoreId(
                        storeId,
                        dto.isActive,
                        dto.isDemping,
                        BATCH_SIZE,
                        processedCount
                    )

                    if (products.length === 0) {
                        hasMoreProducts = false;
                        continue;
                    }

                    // Берём все записи наличия из БД (без фильтра available) — остатки и предзаказ из нашей БД
                    const availabilities = await this.kaspiProductAvailabilityOnPickupPointModel
                        .find({
                            productId: { $in: products.map((p) => p._id) },
                            storePickupPointId: { $in: warehouses.map((w) => w._id) },
                        })
                        .lean()

                    const productInCities = await this.storeCityService.getProductCitiesByProductIds(
                        products.map((p) => p._id.toString())
                    )

                    const availabilityMap = new Map()
                    availabilities.forEach((a) =>
                        availabilityMap.set(a.productId.toString() + '_' + a.storePickupPointId.toString(), a)
                    )

                    const productInCityMap = new Map()
                    productInCities.forEach((p) =>
                        productInCityMap.set(p.productId.toString() + '_' + p.storeCityId.toString(), p)
                    )

                    const CHUNK_SIZE = 25
                    for (let i = 0; i < products.length; i += CHUNK_SIZE) {
                        const chunk = products.slice(i, i + CHUNK_SIZE)
                        
                        for (const product of chunk) {
                            try {
                                // Для каждого склада создаём отдельную строку
                                for (const warehouse of warehouses) {
                                    const availability = availabilityMap.get(
                                        product._id.toString() + '_' + warehouse._id.toString()
                                    )

                                    // Находим настройки цен по городу, к которому относится склад
                                    const storeCity = storeCityByCityId.get(warehouse.cityId)
                                    const productInCity =
                                        storeCity &&
                                        productInCityMap.get(
                                            product._id.toString() + '_' + storeCity._id.toString()
                                        )

                                    const minPrice =
                                        productInCity?.availableMinPrice || product.availableMinPrice
                                    const maxPrice =
                                        productInCity?.availableMaxPrice || product.availableMaxPrice

                                    // Цена: при демпинге — expectedPrice если есть, иначе product.price
                                    const price =
                                        product.isDemping && (product as any).expectedPrice
                                            ? (product as any).expectedPrice
                                            : product.price
                                    // Шаг снижения — из БД (product.dempingPrice)
                                    const dempingStep =
                                        product.isDemping && product.dempingPrice != null
                                            ? Math.ceil(product.dempingPrice)
                                            : ''

                                    worksheet.cell(row, 1).string(store.name)
                                    worksheet.cell(row, 2).string(product.name)
                                    worksheet.cell(row, 3).string(product.sku)
                                    worksheet.cell(row, 4).string(product.isActive ? 'да' : 'нет')
                                    // В колонке "Склад" пишем только название склада (displayName)
                                    worksheet.cell(row, 5).string(warehouse.displayName || warehouse.name)
                                    worksheet.cell(row, 6).number(Math.ceil(price || 0))
                                    worksheet.cell(row, 7).number(Math.ceil(minPrice || 0))
                                    worksheet.cell(row, 8).number(Math.ceil(maxPrice || 999999999))
                                    worksheet
                                        .cell(row, 9)
                                        .number(
                                            Math.ceil(
                                                (availability?.amount as number | undefined) ??
                                                    (product.isActive ? 999 : 0)
                                            )
                                        )
                                    worksheet
                                        .cell(row, 10)
                                        .string(availability?.available === true ? 'да' : 'нет')
                                    worksheet
                                        .cell(row, 11)
                                        .number(Math.ceil((availability?.preOrder as number | undefined) || 0))
                                    worksheet.cell(row, 12).string(product.isDemping ? 'да' : 'нет')
                                    worksheet
                                        .cell(row, 13)
                                        .string(
                                            dempingStep !== '' ? String(dempingStep) : ''
                                        )
                                    worksheet
                                        .cell(row, 14)
                                        .string(
                                            product.purchasePrice
                                                ? Math.ceil(product.purchasePrice).toString()
                                                : ''
                                        )
                                    row++
                                }
                            } catch (productError) {
                                console.error(
                                    `[generateExample] Error processing product ${product.sku}:`,
                                    productError
                                )
                            }
                        }
                    }

                    processedCount += products.length
                    totalProcessed += products.length
                    console.log(
                        `[generateExample] Processed ${totalProcessed} products so far for store: ${store.name}`
                    )

                    // Clear memory
                    products.length = 0
                    availabilities.length = 0
                    productInCities.length = 0
                    availabilityMap.clear()
                    productInCityMap.clear()

                    if (global.gc) {
                        global.gc()
                    }

                } catch (batchError) {
                    console.error(`[generateExample] Error processing batch:`, batchError)
                }
            }

            const dateName = new Date().toLocaleString('ru-RU', {
                timeZone: 'Asia/Almaty',
            }).replace(/[^\d\w]/g, '_'); 
            const uploadFolder = path2.join(path, 'uploads', 'examples', 'price-list-kaspi');

            await ensureDir(uploadFolder);
            
            const fileName = `${store._id}_${dateName}.xlsx`;
            const fullPath = path2.join(uploadFolder, fileName);

            console.log(`[generateExample] Writing file to: ${fullPath}`);
            await workbook.write(fullPath);

            const newPriceListExample = new this.priceListExampleModel({
                name: fileName,
                path: fullPath,
                storeId,
            });

            console.log(`[generateExample] Example saved for store: ${store.name}`, new Date());
            await newPriceListExample.save();

            return;
        } catch (error) {
            console.error('[generateExample] Fatal error:', error);
            throw error;
        }
    }

    async getPriceListExampleById(id: string) {
        if (!isValidObjectId(id)) {
            throw new NotFoundException()
        }

        const data = await this.priceListExampleModel.findOne({ _id: id })

        if (!data) {
            throw new NotFoundException()
        }

        return data
    }

    async getLastPriceListExample(storeId: string) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException()
        }

        const lastExample = await this.priceListExampleModel.findOne({ storeId }).sort({ _id: -1 })

        if (!lastExample) {
            throw new NotFoundException()
        }

        return lastExample
    }

    private async readDataFromExcelFile(store: StoreModel, filePath: string): Promise<ProductItemPriceDto[]> {
        const storeCities = await this.storeCityService.getStoreCities(store._id.toString())
        // Для работы формата с колонкой "Склад" заранее загружаем склады магазина
        const pickupPoints = await this.KaspiStorePickupPointModel.find({
            storeId: store._id,
            status: 'ACTIVE',
        }).lean()

        const workSheetsFromBuffer = parse(readFileSync(filePath))

        const result: ProductItemPriceDto[] = []

        const sheet = workSheetsFromBuffer[0]

        // Определяем формат по заголовкам
        const headerRow = sheet.data[0]?.map((cell: any) => (cell ? cell.toString().trim().toLowerCase() : '')) || []
        const hasCityColumn = headerRow.includes('город')
        const hasWarehouseColumn = headerRow.includes('склад')
        const isNewFormat = hasCityColumn || hasWarehouseColumn

        if (isNewFormat) {
            // Новый формат: ищем индексы колонок по заголовкам
            const colIndex = (name: string) =>
                headerRow.findIndex(
                    (h) => h.replace(/\s+/g, '') === name.toLowerCase().replace(/\s+/g, '')
                )
            const idxName = colIndex('название')
            const idxSku = colIndex('sku')
            // В новой версии вместо "Город" может быть "Склад"
            const idxLocation = hasCityColumn ? colIndex('город') : colIndex('склад')
            const idxPrice = colIndex('цена')
            const idxMin = colIndex('минимум')
            const idxMax = colIndex('максимум')
            const idxAmount = colIndex('остаток')
            const idxAvailability = colIndex('наличие')
            const idxPreOrder = colIndex('предзаказ')
            // Новые колонки:
            const idxIsActive = colIndex('опубликовано')
            const idxIsDemping = colIndex('включитьавтоснижениецены')
            const idxDempingPrice = colIndex('шагсниженияцены')
            const idxPurchasePrice = colIndex('закупочнаяцена,тг')

            // Временный объект для группировки по SKU
            const skuMap = new Map<string, ProductItemPriceDto>()

            for (let i = 1; i < sheet.data.length; i++) {
                const row = sheet.data[i]
                if (!row) continue
                const name = row[idxName]?.toString() || ''
                const sku = row[idxSku]?.toString() || ''
                const locationValue = row[idxLocation]?.toString().trim() || ''
                if (!sku || !locationValue) continue // Без SKU или города/склада — пропускаем
                const price = Math.ceil(parseFloat(row[idxPrice]) || 0)
                const minPrice = Math.ceil(parseFloat(row[idxMin]) || 0)
                const maxPrice = Math.ceil(parseFloat(row[idxMax]) || 0)
                const amountRaw = row[idxAmount]
                const amount =
                    amountRaw !== undefined && amountRaw !== null && String(amountRaw).trim() !== ''
                        ? Math.ceil(parseFloat(String(amountRaw)) || 0)
                        : null
                const preOrder = Math.ceil(parseFloat(row[idxPreOrder]) || 0)
                let available: boolean | undefined
                if (idxAvailability !== -1) {
                    const val = row[idxAvailability]?.toString().toLowerCase().trim()
                    available = val === 'да' || val === 'yes' || val === 'true'
                }

                // Новые поля (берём только из первой строки по SKU, либо если есть в строке)
                let isDemping = false
                let dempingPrice = 0
                let purchasePrice = 0
                let isActive = false
                if (idxIsDemping !== -1) {
                    const val = row[idxIsDemping]?.toString().toLowerCase().trim()
                    isDemping = val === 'да' || val === 'yes' || val === 'true'
                }
                if (idxIsActive !== -1) {
                    const val = row[idxIsActive]?.toString().toLowerCase().trim()
                    isActive = val === 'да' || val === 'yes' || val === 'true'
                }
                if (idxDempingPrice !== -1) {
                    dempingPrice = Math.ceil(parseFloat(row[idxDempingPrice]) || 0)
                }
                if (idxPurchasePrice !== -1) {
                    purchasePrice = Math.ceil(parseFloat(row[idxPurchasePrice]) || 0)
                }

                // Определяем город по названию города или склада
                let cityId: string | undefined
                let isMain = false
                const productCity = new ProductItemPriceCityDto()

                if (hasCityColumn) {
                    // Старый "новый" формат: в колонке указан город
                    const cityName = locationValue
                    const city = storeCities.find(
                        (c) =>
                            c.cityName.replace(/\s+/g, '').toLowerCase() ===
                            cityName.replace(/\s+/g, '').toLowerCase()
                    )
                    cityId = city ? city.cityId : undefined
                    if (
                        !cityId &&
                        store.mainCity &&
                        store.mainCity.name.replace(/\s+/g, '').toLowerCase() ===
                            cityName.replace(/\s+/g, '').toLowerCase()
                    ) {
                        cityId = store.mainCity.id
                        isMain = true
                    }
                } else {
                    // Новый формат: в колонке указан склад (displayName)
                    const warehouseName = locationValue
                    const pickupPoint = pickupPoints.find(
                        (pp) =>
                            (pp.displayName || '').trim().toLowerCase() ===
                            warehouseName.trim().toLowerCase()
                    )
                    if (!pickupPoint) {
                        // eslint-disable-next-line no-console
                        console.log(
                            `[ExcelParser] Не найден склад по названию: '${warehouseName}' (SKU: ${sku})`
                        )
                    } else {
                        cityId = pickupPoint.cityId
                        if (pickupPoint.cityId === store.mainCity?.id) {
                            isMain = true
                        }
                        productCity.storePickupPointId = pickupPoint._id.toString()
                    }
                }

                if (!cityId) {
                    // eslint-disable-next-line no-console
                    console.log(
                        `[ExcelParser] Не найден город/склад для значения '${locationValue}' (SKU: ${sku})`
                    )
                    continue
                }
                productCity.cityId = cityId
                productCity.availableMinPrice = minPrice
                productCity.availableMaxPrice = maxPrice
                productCity.amount = amount
                productCity.preOrder = preOrder
                productCity.isMain = isMain
                if (available !== undefined) {
                    productCity.available = available
                }
                const key = sku + '___' + name
                let productItem = skuMap.get(key)
                if (!productItem) {
                    productItem = new ProductItemPriceDto()
                    productItem.name = name
                    productItem.sku = sku
                    productItem.cities = []
                    productItem.price = price
                    productItem.line = i
                    // Новые поля:
                    productItem.isDemping = isDemping
                    productItem.dempingPrice = dempingPrice
                    productItem.purchasePrice = purchasePrice
                    productItem.isActive = isActive
                    skuMap.set(key, productItem)
                }
                productItem.cities.push(productCity)
            }
            // Собираем результат
            for (const item of skuMap.values()) {
                result.push(item)
            }
        } else {
            // Старый формат (как раньше)
            let rowCount = 1
            for (const row of sheet.data) {
                rowCount++

                if (rowCount <= 3) {
                    continue
                }

                if (row[1] !== 'SKU') {
                    if (row['length'] === 0) {
                        continue
                    }

                    const newProductItem = new ProductItemPriceDto()
                    const productItemCities: ProductItemPriceCityDto[] = []
                    newProductItem.cities = productItemCities
                    newProductItem.name = row[0]?.toString()
                    newProductItem.sku = row[1]?.toString()

                    let column = 2
                    const otherCities: ProductItemPriceCityDto[] = []

                    // Главный город
                    const mainCityItem = new ProductItemPriceCityDto()
                    mainCityItem.isMain = true

                    const minPrice = Math.ceil(parseFloat(row[column++]?.toString().trim()) || 0)
                    const maxPrice = Math.ceil(parseFloat(row[column++]?.toString().trim()) || 0)
                    const amount = Math.ceil(parseFloat(row[column++]?.toString().trim()) || 0)
                    // if(store.changePriceMethod !== "REQUEST"){
                    const preOrder = Math.ceil(parseFloat(row[column++]?.toString().trim()) || 0)
                    mainCityItem.preOrder = preOrder
                    // }

                    mainCityItem.availableMinPrice = minPrice
                    mainCityItem.availableMaxPrice = maxPrice
                    mainCityItem.amount = amount
                    mainCityItem.cityId = store.mainCity.id

                    otherCities.push(mainCityItem)

                    // Дополнительные города
                    for (let i = 0; i < storeCities.length; i++) {
                        const newProductItemCity = new ProductItemPriceCityDto()

                        newProductItemCity.isMain = false
                        newProductItemCity.availableMinPrice = Math.ceil(parseFloat(row[column]?.toString()) || 0)
                        newProductItemCity.availableMaxPrice = Math.ceil(parseFloat(row[column + 1]?.toString()) || 0)
                        newProductItemCity.amount = Math.ceil(parseFloat(row[column + 2]?.toString()) || 0)
                        newProductItemCity.cityId = storeCities[i].cityId
                        
                        // if(store.changePriceMethod !== "REQUEST"){
                        newProductItemCity.preOrder = Math.ceil(parseFloat(row[column + 3]?.toString()) || 0)
                        column += 4
                        // }else{
                        //     column += 3
                        // }

                        otherCities.push(newProductItemCity)
                    }
                    const isDemping = row[column++]?.toString().toLowerCase().trim() === 'да'
                    const dempingPrice = Math.ceil(parseFloat(row[column++]?.toString().trim()) || 0)
                    const purchasePrice = Math.ceil(parseFloat(row[column++]?.toString().trim()) || 0)
                    const currentPrice = Math.ceil(parseFloat(row[column]?.toString().trim()) || 0)
                    if (currentPrice) {
                        newProductItem.price = currentPrice
                    }

                    newProductItem.isDemping = isDemping
                    newProductItem.cities = otherCities
                    newProductItem.dempingPrice = dempingPrice
                    newProductItem.purchasePrice = purchasePrice
                    newProductItem.line = rowCount - 1
                    // if (newProductItem.name.length <= 0 || newProductItem.sku.length <= 0) {
                    //     throw new BadRequestException(`Ошибка на ${rowCount - 1} строке файла: название товара или SKU не найдено.`)
                    // }

                    result.push(newProductItem)
                }
            }
        }

        return result
    }

    public async getKaspiPriceListHistory(storeId: string, page: number, limit: number = 20) {

        const totalCount = await this.storePriceListUploadModel.count({
            storeId,
        })

        const data = await this.storePriceListUploadModel.aggregate([
            {
                $match: {
                    storeId: new Types.ObjectId(storeId),
                },
            },
            {
                $sort: {
                    _id: -1,
                },
            },
            {
                $lookup: {
                    from: 'StorePriceListProductUpdateHistory',
                    as: 'storePriceListProductUpdateHistory',
                    localField: '_id',
                    foreignField: 'storePriceListUploadId',
                    pipeline: [
                        {
                            $match: {
                                status: 'SUCCESS',
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                            },
                        },
                    ],
                },
            },
            {
                $set: {
                    successCount: {
                        $size: '$storePriceListProductUpdateHistory',
                    },
                },
            },
            {
                $lookup: {
                    from: 'StorePriceListProductUpdateHistory',
                    as: 'storePriceListProductUpdateHistory',
                    localField: '_id',
                    foreignField: 'storePriceListUploadId',
                    pipeline: [
                        {
                            $match: {
                                status: 'PRODUCT_NOT_FOUND',
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                            },
                        },
                    ],
                },
            },
            {
                $set: {
                    productNotFoundCount: {
                        $size: '$storePriceListProductUpdateHistory',
                    },
                },
            },
            {
                $lookup: {
                    from: 'StorePriceListProductUpdateHistory',
                    as: 'storePriceListProductUpdateHistory',
                    localField: '_id',
                    foreignField: 'storePriceListUploadId',
                    pipeline: [
                        {
                            $match: {
                                status: 'INVALID_FORMAT',
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                            },
                        },
                    ],
                },
            },
            {
                $set: {
                    invalidFormatCount: {
                        $size: '$storePriceListProductUpdateHistory',
                    },
                },
            },
            {
                $unset: ['storePriceListProductUpdateHistory'],
            },
            {
                $skip: limit * (page - 1),
            },
            {
                $limit: limit,
            },
        ])

        return {
            totalCount,
            data,
        }
    }

    public async getKaspiPriceListHistoryById(storeId: string, historyId: string) {
        const data = await this.storePriceListUploadModel.aggregate([
            {
                $match: {
                    storeId: new Types.ObjectId(storeId),
                    _id: new Types.ObjectId(historyId),
                },
            },
            {
                $sort: {
                    _id: -1,
                },
            },
            {
                $lookup: {
                    from: 'StorePriceListProductUpdateHistory',
                    as: 'storePriceListProductUpdateHistory',
                    localField: '_id',
                    foreignField: 'storePriceListUploadId',
                    pipeline: [
                        {
                            $match: {
                                status: 'SUCCESS',
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                            },
                        },
                    ],
                },
            },
            {
                $set: {
                    successCount: {
                        $size: '$storePriceListProductUpdateHistory',
                    },
                },
            },
            {
                $lookup: {
                    from: 'StorePriceListProductUpdateHistory',
                    as: 'storePriceListProductUpdateHistory',
                    localField: '_id',
                    foreignField: 'storePriceListUploadId',
                    pipeline: [
                        {
                            $match: {
                                status: 'PRODUCT_NOT_FOUND',
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                            },
                        },
                    ],
                },
            },
            {
                $set: {
                    productNotFoundCount: {
                        $size: '$storePriceListProductUpdateHistory',
                    },
                },
            },
            {
                $lookup: {
                    from: 'StorePriceListProductUpdateHistory',
                    as: 'storePriceListProductUpdateHistory',
                    localField: '_id',
                    foreignField: 'storePriceListUploadId',
                    pipeline: [
                        {
                            $match: {
                                status: 'INVALID_FORMAT',
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                            },
                        },
                    ],
                },
            },
            {
                $set: {
                    invalidFormatCount: {
                        $size: '$storePriceListProductUpdateHistory',
                    },
                },
            },
            {
                $unset: ['storePriceListProductUpdateHistory'],
            },
        ])

        if (data.length === 0) {
            throw new NotFoundException()
        }

        return data[0]
    }

    public async getProductUpdateHistories(storeId: string, historyId: string, page: number, filter: string, query: string) {
        const limit = 50

        const matchQuery: any = {
            storePriceListUploadId: new Types.ObjectId(historyId),
            storeId: new Types.ObjectId(storeId),
            $or: [
                {
                    productSku: {
                        $regex: query || '',
                        $options: 'i',
                    },
                },
                {
                    productName: {
                        $regex: query || '',
                        $options: 'i',
                    },
                },
            ],
        }
        if (filter === 'success') {
            matchQuery.status = 'SUCCESS'
        } else if (filter === 'product-not-found') {
            matchQuery.status = 'PRODUCT_NOT_FOUND'
        } else if (filter === 'invalid-format') {
            matchQuery.status = 'INVALID_FORMAT'
        }

        const totalCount = await this.storePriceListProductUpdateHistoryModel.count(matchQuery)

        const data = await this.storePriceListProductUpdateHistoryModel
            .find(matchQuery)
            .skip((page - 1) * limit)
            .limit(limit)

        return {
            totalCount,
            data,
        }
    }
}
