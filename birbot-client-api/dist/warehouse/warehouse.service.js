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
exports.WarehouseService = void 0;
const common_1 = require("@nestjs/common");
const app_root_path_1 = require("app-root-path");
const path2 = require("path");
const date_fns_1 = require("date-fns");
const product_service_1 = require("../product/product.service");
const store_service_1 = require("../store/store.service");
const mongoose_1 = require("mongoose");
const store_constants_1 = require("../store/store.constants");
const fs_extra_1 = require("fs-extra");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const store_city_service_1 = require("../store-city/store-city.service");
const xml2json_1 = require("xml2json");
const fs_1 = require("fs");
const node_xlsx_1 = require("node-xlsx");
const price_list_example_mode_1 = require("./price-list-example.mode");
const product_item_price_dto_1 = require("./dto/product-item-price.dto");
const product_item_price_city_dto_1 = require("./dto/product-item-price-city.dto");
const update_product_dto_1 = require("../product/dto/update-product.dto");
const update_product_cities_dto_1 = require("../store-city/dto/update-product-cities.dto");
const product_1 = require("../product/product");
const store_model_1 = require("../store/store.model");
const store_price_list_upload_model_1 = require("./store-price-list-upload.model");
const bull_1 = require("@nestjs/bull");
const store_price_list_product_update_history_model_1 = require("./store-price-list-product-update-history.model");
const kaspi_product_availability_on_pickup_point_model_1 = require("../product/kaspi-product-availability-on-pickup-point.model");
const kaspi_store_pickup_point_model_1 = require("../store/kaspi-store-pickup-point.model");
const class_validator_1 = require("class-validator");
const redis_1 = require("redis");
let WarehouseService = class WarehouseService {
    constructor(storePriceListUploadModel, priceListExampleModel, storePriceListProductUpdateHistoryModel, kaspiProductAvailabilityOnPickupPointModel, KaspiStorePickupPointModel, storeModel, productService, product, storeService, storeCityService, updateProductFromPriceListQueue, loadSpecificKaspiProductQueue, actualizeProductAvailabilitiesAndSettingsFromExternalXmlQueue) {
        this.storePriceListUploadModel = storePriceListUploadModel;
        this.priceListExampleModel = priceListExampleModel;
        this.storePriceListProductUpdateHistoryModel = storePriceListProductUpdateHistoryModel;
        this.kaspiProductAvailabilityOnPickupPointModel = kaspiProductAvailabilityOnPickupPointModel;
        this.KaspiStorePickupPointModel = KaspiStorePickupPointModel;
        this.storeModel = storeModel;
        this.productService = productService;
        this.product = product;
        this.storeService = storeService;
        this.storeCityService = storeCityService;
        this.updateProductFromPriceListQueue = updateProductFromPriceListQueue;
        this.loadSpecificKaspiProductQueue = loadSpecificKaspiProductQueue;
        this.actualizeProductAvailabilitiesAndSettingsFromExternalXmlQueue = actualizeProductAvailabilitiesAndSettingsFromExternalXmlQueue;
        this.techRedisClient = (0, redis_1.createClient)({
            url: process.env.TECH_REDIS_URL || '',
        });
        this.techRedisClient.connect().then(() => {
            console.log(`TECH REDIS CONNECTED`);
        });
    }
    parseAvailability(availability) {
        return {
            available: availability.available === 'yes',
            storeId: availability.storeId,
            preOrder: parseInt(availability.preOrder || '0'),
            stock: availability.stockCount ? parseInt(availability.stockCount) : undefined
        };
    }
    parseCity(city) {
        return {
            cityId: city.cityId,
            availableMinPrice: city.availableMinPrice ? parseInt(city.availableMinPrice) : undefined,
            availableMaxPrice: city.availableMaxPrice ? parseInt(city.availableMaxPrice) : undefined,
            price: city.price ? parseInt(city.price) : undefined
        };
    }
    async parseKaspiXmlToJson(data) {
        const jsonString = (0, xml2json_1.toJson)(data);
        if (!jsonString) {
            throw new Error('Error occurred on parse xml');
        }
        const jsonData = JSON.parse(jsonString);
        const company = jsonData.kaspi_catalog.company;
        const merchantId = jsonData.kaspi_catalog.merchantid;
        if (!(0, class_validator_1.isString)(company) || !(0, class_validator_1.isString)(merchantId)) {
            throw new Error('Not found company or merchantid');
        }
        const offers = jsonData.kaspi_catalog.offers.offer || [];
        const kaspiOffers = [];
        console.log(`offers count for ${company}: ${offers === null || offers === void 0 ? void 0 : offers.length}`);
        await Promise.all(offers.map((offer) => {
            var _a, _b;
            const kaspiAvailabilities = [];
            const availabilities = offer.availabilities.availability;
            if (Array.isArray(availabilities)) {
                for (const availability of availabilities) {
                    kaspiAvailabilities.push(this.parseAvailability(availability));
                }
            }
            else {
                kaspiAvailabilities.push(this.parseAvailability(availabilities));
            }
            const kaspiCities = [];
            const cities = (_a = offer === null || offer === void 0 ? void 0 : offer.cities) === null || _a === void 0 ? void 0 : _a.city;
            if (Array.isArray(cities)) {
                for (const city of cities) {
                    kaspiCities.push(this.parseCity(city));
                }
            }
            else if (cities) {
                kaspiCities.push(this.parseCity(cities));
            }
            const kaspiPrices = [];
            if ((0, class_validator_1.isNumberString)(offer.price) || (0, class_validator_1.isNumber)(offer.price)) {
                kaspiPrices.push({
                    price: parseInt(`${offer.price}`),
                });
            }
            const cityprices = (_b = offer === null || offer === void 0 ? void 0 : offer.cityprices) === null || _b === void 0 ? void 0 : _b.cityprice;
            if (cityprices) {
                if (Array.isArray(cityprices)) {
                    for (const cityprice of cityprices) {
                        if (cityprice && typeof cityprice === 'object' && cityprice.cityId && cityprice.$t) {
                            kaspiPrices.push({
                                cityId: cityprice.cityId,
                                price: parseInt(`${cityprice.$t}`)
                            });
                        }
                    }
                }
                else {
                    if (cityprices && typeof cityprices === 'object' && cityprices.cityId && cityprices.$t) {
                        kaspiPrices.push({
                            cityId: cityprices.cityId,
                            price: parseInt(`${cityprices.$t}`)
                        });
                    }
                }
            }
            const kaspiMinPrices = [];
            if ((0, class_validator_1.isNumberString)(offer.minprice) || (0, class_validator_1.isNumber)(offer.minprice)) {
                kaspiMinPrices.push({
                    price: parseInt(`${offer.minprice}`),
                });
            }
            const kaspiMaxPrices = [];
            if ((0, class_validator_1.isNumberString)(offer.maxprice) || (0, class_validator_1.isNumber)(offer.maxprice)) {
                kaspiMaxPrices.push({
                    price: parseInt(`${offer.maxprice}`),
                });
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
            });
        }));
        return {
            company,
            merchantId,
            offers: kaspiOffers
        };
    }
    async uploadPriceList(file, storeId) {
        if (!file) {
            throw new common_1.BadRequestException();
        }
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeService.getStoreById(storeId);
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const dateFolder = (0, date_fns_1.format)(new Date(), 'dd-MM-yyyy');
        const uploadFolder = path2.join(app_root_path_1.path, 'uploads', 'price-lists', 'kaspi', `${store.name.replace(/[<>:"/\\|?*]/g, "_")}-${dateFolder}`);
        await (0, fs_extra_1.ensureDir)(uploadFolder);
        await (0, fs_extra_1.writeFile)(`${uploadFolder}/${file.originalname}`, file.buffer);
        const fullPath = `${uploadFolder}/${file.originalname}`;
        const isXmlExtension = file.originalname.toLowerCase().endsWith('.xml');
        const isXmlMime = file.mimetype === 'text/xml' || file.mimetype === 'application/xml';
        if (isXmlExtension && isXmlMime) {
            const xmlString = file.buffer.toString('utf8');
            const offers = await this.parseKaspiXmlToJson(xmlString);
            console.log(offers.offers.length);
            await Promise.all(offers.offers.map(async (offer) => {
                const jobId = `${storeId.toString()}_${offer.sku}`;
                await this.loadSpecificKaspiProductQueue.add({
                    storeId: storeId.toString(),
                    sku: offer.sku,
                }, {
                    removeOnComplete: true,
                    removeOnFail: true,
                    priority: 1,
                    attempts: 5,
                    jobId,
                });
                const product = await this.productService.getProductBySku(offer.sku);
                if (product) {
                    await this.actualizeProductAvailabilitiesAndSettingsFromExternalXmlQueue.add({
                        storeId,
                        productId: product._id,
                        offer
                    }, {
                        removeOnFail: true,
                        removeOnComplete: true,
                        attempts: 3,
                        priority: 1
                    });
                }
            }));
            const newStorePriceListUpload = await new this.storePriceListUploadModel({
                storeId,
                originalFileName: file.originalname,
                distinctOffersCount: offers.offers.length,
            }).save();
            return {
                id: newStorePriceListUpload._id,
            };
        }
        const products = await this.readDataFromExcelFile(store, fullPath);
        const newStorePriceListUpload = await new this.storePriceListUploadModel({
            storeId,
            originalFileName: file.originalname,
            distinctOffersCount: products.length,
        }).save();
        for (const product of products) {
            this.updateProductFromPriceListQueue.add({
                storeId,
                storePriceListUploadId: newStorePriceListUpload._id,
                product,
            }, {
                removeOnComplete: true,
                removeOnFail: true,
                priority: 3,
            });
        }
        return {
            id: newStorePriceListUpload._id,
        };
    }
    async updateProducts(products, storeId) {
        let i = 0;
        for (const product of products) {
            try {
                i++;
                const foundProduct = await this.productService.getProductByQuery({
                    sku: product.sku,
                    storeId,
                });
                if (!foundProduct) {
                    console.log(`PRODUCT NOT FOUND | ${product.sku} | ${storeId}`);
                    continue;
                }
                const mainCity = product.cities.find((v) => v.isMain);
                const updateProductDto = new update_product_dto_1.UpdateProductDto();
                if (product.isDemping !== undefined)
                    updateProductDto.isDemping = product.isDemping;
                if (product.dempingPrice !== undefined)
                    updateProductDto.dempingPrice = product.dempingPrice;
                if (product.purchasePrice !== undefined)
                    updateProductDto.purchasePrice = product.purchasePrice;
                if (mainCity) {
                    updateProductDto.availableMinPrice = mainCity.availableMinPrice;
                    updateProductDto.availableMaxPrice = mainCity.availableMaxPrice;
                    updateProductDto.amount = mainCity.amount;
                }
                const productCities = await this.storeCityService.getProductCities(foundProduct._id.toString());
                const otherCities = product.cities.filter((v) => !v.isMain);
                const updateProductCities = [];
                for (const productCity of productCities) {
                    const foundCity = otherCities.find((v) => v.cityId === productCity.cityId);
                    if (foundCity) {
                        const newUpdateProductCity = new update_product_cities_dto_1.UpdateProductCitiesDto();
                        newUpdateProductCity.productCityId = productCity._id;
                        newUpdateProductCity.availableMinPrice = foundCity.availableMinPrice;
                        newUpdateProductCity.availableMaxPrice = foundCity.availableMaxPrice;
                        updateProductCities.push(newUpdateProductCity);
                    }
                }
                await this.storeCityService.updateProductCities(updateProductCities);
                try {
                    await this.product.updateProduct(foundProduct._id.toString(), updateProductDto);
                }
                catch (e) { }
            }
            catch (e) {
                console.log('[^]' + ' warehouse.sarvice ' + ' | ' + new Date() + ' | ' + '\n' + e);
            }
        }
        console.log('UPLOAD PRICE LIST ENDED');
    }
    async getExample(storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const store = await this.storeService.getStoreById(storeId);
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const excel = require('excel4node');
        const workbook = new excel.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');
        worksheet.cell(1, 1).string('Магазин');
        worksheet.cell(1, 2).string('Название');
        worksheet.cell(1, 3).string('SKU');
        worksheet.cell(1, 4).string('Опубликовано');
        worksheet.cell(1, 5).string('Город');
        worksheet.cell(1, 6).string('Цена');
        worksheet.cell(1, 7).string('Минимум');
        worksheet.cell(1, 8).string('Максимум');
        worksheet.cell(1, 9).string('Остаток');
        worksheet.cell(1, 10).string('Предзаказ');
        worksheet.cell(1, 11).string('Включить автоснижение цены');
        worksheet.cell(1, 12).string('Шаг снижения цены');
        worksheet.cell(1, 13).string('Закупочная цена, тг');
        const products = await this.productService.getAllProductsByStoreId(storeId);
        const storeCities = await this.storeCityService.getStoreCities(storeId);
        let row = 2;
        for (const product of products) {
            const mainWarehouse = await this.KaspiStorePickupPointModel.findOne({
                cityId: store.mainCity.id,
                storeId: storeId,
                status: 'ACTIVE'
            });
            const mainCityAvailability = await this.kaspiProductAvailabilityOnPickupPointModel.findOne({
                productId: product._id,
                storePickupPointId: mainWarehouse === null || mainWarehouse === void 0 ? void 0 : mainWarehouse._id,
                available: true
            }).sort({ updatedAt: -1 });
            worksheet.cell(row, 1).string(store.name);
            worksheet.cell(row, 2).string(product.name);
            worksheet.cell(row, 3).string(product.sku);
            worksheet.cell(row, 4).string(product.isActive ? 'да' : 'нет');
            worksheet.cell(row, 5).string(store.mainCity.name);
            worksheet.cell(row, 6).number(product.price || 0);
            worksheet.cell(row, 7).number(product.availableMinPrice || 0);
            worksheet.cell(row, 8).number(product.availableMaxPrice || 999999999);
            worksheet.cell(row, 9).number((mainCityAvailability === null || mainCityAvailability === void 0 ? void 0 : mainCityAvailability.amount) || 0);
            worksheet.cell(row, 10).number((mainCityAvailability === null || mainCityAvailability === void 0 ? void 0 : mainCityAvailability.preOrder) || 0);
            worksheet.cell(row, 11).string(product.isDemping ? 'да' : 'нет');
            worksheet.cell(row, 12).string(product.dempingPrice ? product.dempingPrice.toString() : '');
            worksheet.cell(row, 13).string(product.purchasePrice ? product.purchasePrice.toString() : '');
            row++;
            for (const storeCity of storeCities) {
                const productInCity = await this.storeCityService.getProductCityByQuery({
                    productId: product._id,
                    storeCityId: storeCity._id
                });
                const warehouse = await this.KaspiStorePickupPointModel.findOne({
                    cityId: storeCity.cityId,
                    storeId: storeId,
                    status: 'ACTIVE'
                });
                const cityAvailability = await this.kaspiProductAvailabilityOnPickupPointModel.findOne({
                    productId: product._id,
                    storePickupPointId: warehouse === null || warehouse === void 0 ? void 0 : warehouse._id,
                    available: true
                }).sort({ updatedAt: -1 });
                const minPrice = (productInCity === null || productInCity === void 0 ? void 0 : productInCity.availableMinPrice) || product.availableMinPrice;
                const maxPrice = (productInCity === null || productInCity === void 0 ? void 0 : productInCity.availableMaxPrice) || product.availableMaxPrice;
                worksheet.cell(row, 1).string(store.name);
                worksheet.cell(row, 2).string(product.name);
                worksheet.cell(row, 3).string(product.sku);
                worksheet.cell(row, 4).string(product.isActive ? 'да' : 'нет');
                worksheet.cell(row, 5).string(storeCity.cityName);
                worksheet.cell(row, 6).number(product.price || 0);
                worksheet.cell(row, 7).number(minPrice || 0);
                worksheet.cell(row, 8).number(maxPrice || 999999999);
                worksheet.cell(row, 9).number((cityAvailability === null || cityAvailability === void 0 ? void 0 : cityAvailability.amount) || 0);
                worksheet.cell(row, 10).number((cityAvailability === null || cityAvailability === void 0 ? void 0 : cityAvailability.preOrder) || 0);
                worksheet.cell(row, 11).string(product.isDemping ? 'да' : 'нет');
                worksheet.cell(row, 12).string(product.dempingPrice ? product.dempingPrice.toString() : '');
                worksheet.cell(row, 13).string(product.purchasePrice ? product.purchasePrice.toString() : '');
                row++;
            }
        }
        const dateName = (0, date_fns_1.format)(new Date(), 'dd.MM.yyyy HH:mm:ss');
        const uploadFolder = `${app_root_path_1.path}/uploads/examples/price-list-kaspi/${store.name}`;
        await (0, fs_extra_1.ensureDir)(uploadFolder);
        const fullPath = `${uploadFolder}/${dateName}.xlsx`;
        await workbook.write(fullPath);
        await this.sleep(1000);
        return fullPath;
    }
    async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async generateExample(storeId, dto) {
        var _a;
        try {
            if (!(0, mongoose_1.isValidObjectId)(storeId)) {
                throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
            }
            const store = await this.storeService.getStoreById(storeId);
            if (!store) {
                throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
            }
            console.log(`[generateExample] Starting for store: ${store.name}`);
            const BATCH_SIZE = 250;
            const storeCities = await this.storeCityService.getStoreCities(storeId);
            const warehouses = await this.KaspiStorePickupPointModel.find({ storeId, status: 'ACTIVE' });
            const storeCityByCityId = new Map();
            storeCities.forEach((sc) => {
                storeCityByCityId.set(sc.cityId, sc);
            });
            const excel = require('excel4node');
            const workbook = new excel.Workbook();
            const worksheet = workbook.addWorksheet('Sheet 1');
            worksheet.cell(1, 1).string('Магазин');
            worksheet.cell(1, 2).string('Название');
            worksheet.cell(1, 3).string('SKU');
            worksheet.cell(1, 4).string('Опубликовано');
            worksheet.cell(1, 5).string('Склад');
            worksheet.cell(1, 6).string('Цена');
            worksheet.cell(1, 7).string('Минимум');
            worksheet.cell(1, 8).string('Максимум');
            worksheet.cell(1, 9).string('Остаток');
            worksheet.cell(1, 10).string('Наличие');
            worksheet.cell(1, 11).string('Предзаказ');
            worksheet.cell(1, 12).string('Включить автоснижение цены');
            worksheet.cell(1, 13).string('Шаг снижения цены');
            worksheet.cell(1, 14).string('Закупочная цена, тг');
            let row = 2;
            let processedCount = 0;
            let hasMoreProducts = true;
            let totalProcessed = 0;
            while (hasMoreProducts) {
                try {
                    console.log(`[generateExample] Processing batch ${processedCount / BATCH_SIZE + 1} for store: ${store.name}`);
                    const products = await this.productService.getFilerProductsByStoreId(storeId, dto.isActive, dto.isDemping, BATCH_SIZE, processedCount);
                    if (products.length === 0) {
                        hasMoreProducts = false;
                        continue;
                    }
                    const availabilities = await this.kaspiProductAvailabilityOnPickupPointModel
                        .find({
                        productId: { $in: products.map((p) => p._id) },
                        storePickupPointId: { $in: warehouses.map((w) => w._id) },
                    })
                        .lean();
                    const productInCities = await this.storeCityService.getProductCitiesByProductIds(products.map((p) => p._id.toString()));
                    const availabilityMap = new Map();
                    availabilities.forEach((a) => availabilityMap.set(a.productId.toString() + '_' + a.storePickupPointId.toString(), a));
                    const productInCityMap = new Map();
                    productInCities.forEach((p) => productInCityMap.set(p.productId.toString() + '_' + p.storeCityId.toString(), p));
                    const CHUNK_SIZE = 25;
                    for (let i = 0; i < products.length; i += CHUNK_SIZE) {
                        const chunk = products.slice(i, i + CHUNK_SIZE);
                        for (const product of chunk) {
                            try {
                                for (const warehouse of warehouses) {
                                    const availability = availabilityMap.get(product._id.toString() + '_' + warehouse._id.toString());
                                    const storeCity = storeCityByCityId.get(warehouse.cityId);
                                    const productInCity = storeCity &&
                                        productInCityMap.get(product._id.toString() + '_' + storeCity._id.toString());
                                    const minPrice = (productInCity === null || productInCity === void 0 ? void 0 : productInCity.availableMinPrice) || product.availableMinPrice;
                                    const maxPrice = (productInCity === null || productInCity === void 0 ? void 0 : productInCity.availableMaxPrice) || product.availableMaxPrice;
                                    const price = product.isDemping && product.expectedPrice
                                        ? product.expectedPrice
                                        : product.price;
                                    const dempingStep = product.isDemping && product.dempingPrice != null
                                        ? Math.ceil(product.dempingPrice)
                                        : '';
                                    worksheet.cell(row, 1).string(store.name);
                                    worksheet.cell(row, 2).string(product.name);
                                    worksheet.cell(row, 3).string(product.sku);
                                    worksheet.cell(row, 4).string(product.isActive ? 'да' : 'нет');
                                    worksheet.cell(row, 5).string(warehouse.displayName || warehouse.name);
                                    worksheet.cell(row, 6).number(Math.ceil(price || 0));
                                    worksheet.cell(row, 7).number(Math.ceil(minPrice || 0));
                                    worksheet.cell(row, 8).number(Math.ceil(maxPrice || 999999999));
                                    worksheet
                                        .cell(row, 9)
                                        .number(Math.ceil((_a = availability === null || availability === void 0 ? void 0 : availability.amount) !== null && _a !== void 0 ? _a : (product.isActive ? 999 : 0)));
                                    worksheet
                                        .cell(row, 10)
                                        .string((availability === null || availability === void 0 ? void 0 : availability.available) === true ? 'да' : 'нет');
                                    worksheet
                                        .cell(row, 11)
                                        .number(Math.ceil((availability === null || availability === void 0 ? void 0 : availability.preOrder) || 0));
                                    worksheet.cell(row, 12).string(product.isDemping ? 'да' : 'нет');
                                    worksheet
                                        .cell(row, 13)
                                        .string(dempingStep !== '' ? String(dempingStep) : '');
                                    worksheet
                                        .cell(row, 14)
                                        .string(product.purchasePrice
                                        ? Math.ceil(product.purchasePrice).toString()
                                        : '');
                                    row++;
                                }
                            }
                            catch (productError) {
                                console.error(`[generateExample] Error processing product ${product.sku}:`, productError);
                            }
                        }
                    }
                    processedCount += products.length;
                    totalProcessed += products.length;
                    console.log(`[generateExample] Processed ${totalProcessed} products so far for store: ${store.name}`);
                    products.length = 0;
                    availabilities.length = 0;
                    productInCities.length = 0;
                    availabilityMap.clear();
                    productInCityMap.clear();
                    if (global.gc) {
                        global.gc();
                    }
                }
                catch (batchError) {
                    console.error(`[generateExample] Error processing batch:`, batchError);
                }
            }
            const dateName = new Date().toLocaleString('ru-RU', {
                timeZone: 'Asia/Almaty',
            }).replace(/[^\d\w]/g, '_');
            const uploadFolder = path2.join(app_root_path_1.path, 'uploads', 'examples', 'price-list-kaspi');
            await (0, fs_extra_1.ensureDir)(uploadFolder);
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
        }
        catch (error) {
            console.error('[generateExample] Fatal error:', error);
            throw error;
        }
    }
    async getPriceListExampleById(id) {
        if (!(0, mongoose_1.isValidObjectId)(id)) {
            throw new common_1.NotFoundException();
        }
        const data = await this.priceListExampleModel.findOne({ _id: id });
        if (!data) {
            throw new common_1.NotFoundException();
        }
        return data;
    }
    async getLastPriceListExample(storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException();
        }
        const lastExample = await this.priceListExampleModel.findOne({ storeId }).sort({ _id: -1 });
        if (!lastExample) {
            throw new common_1.NotFoundException();
        }
        return lastExample;
    }
    async readDataFromExcelFile(store, filePath) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
        const storeCities = await this.storeCityService.getStoreCities(store._id.toString());
        const pickupPoints = await this.KaspiStorePickupPointModel.find({
            storeId: store._id,
            status: 'ACTIVE',
        }).lean();
        const workSheetsFromBuffer = (0, node_xlsx_1.parse)((0, fs_1.readFileSync)(filePath));
        const result = [];
        const sheet = workSheetsFromBuffer[0];
        const headerRow = ((_a = sheet.data[0]) === null || _a === void 0 ? void 0 : _a.map((cell) => (cell ? cell.toString().trim().toLowerCase() : ''))) || [];
        const hasCityColumn = headerRow.includes('город');
        const hasWarehouseColumn = headerRow.includes('склад');
        const isNewFormat = hasCityColumn || hasWarehouseColumn;
        if (isNewFormat) {
            const colIndex = (name) => headerRow.findIndex((h) => h.replace(/\s+/g, '') === name.toLowerCase().replace(/\s+/g, ''));
            const idxName = colIndex('название');
            const idxSku = colIndex('sku');
            const idxLocation = hasCityColumn ? colIndex('город') : colIndex('склад');
            const idxPrice = colIndex('цена');
            const idxMin = colIndex('минимум');
            const idxMax = colIndex('максимум');
            const idxAmount = colIndex('остаток');
            const idxAvailability = colIndex('наличие');
            const idxPreOrder = colIndex('предзаказ');
            const idxIsActive = colIndex('опубликовано');
            const idxIsDemping = colIndex('включитьавтоснижениецены');
            const idxDempingPrice = colIndex('шагсниженияцены');
            const idxPurchasePrice = colIndex('закупочнаяцена,тг');
            const skuMap = new Map();
            for (let i = 1; i < sheet.data.length; i++) {
                const row = sheet.data[i];
                if (!row)
                    continue;
                const name = ((_b = row[idxName]) === null || _b === void 0 ? void 0 : _b.toString()) || '';
                const sku = ((_c = row[idxSku]) === null || _c === void 0 ? void 0 : _c.toString()) || '';
                const locationValue = ((_d = row[idxLocation]) === null || _d === void 0 ? void 0 : _d.toString().trim()) || '';
                if (!sku || !locationValue)
                    continue;
                const price = Math.ceil(parseFloat(row[idxPrice]) || 0);
                const minPrice = Math.ceil(parseFloat(row[idxMin]) || 0);
                const maxPrice = Math.ceil(parseFloat(row[idxMax]) || 0);
                const amountRaw = row[idxAmount];
                const amount = amountRaw !== undefined && amountRaw !== null && String(amountRaw).trim() !== ''
                    ? Math.ceil(parseFloat(String(amountRaw)) || 0)
                    : null;
                const preOrder = Math.ceil(parseFloat(row[idxPreOrder]) || 0);
                let available;
                if (idxAvailability !== -1) {
                    const val = (_e = row[idxAvailability]) === null || _e === void 0 ? void 0 : _e.toString().toLowerCase().trim();
                    available = val === 'да' || val === 'yes' || val === 'true';
                }
                let isDemping = false;
                let dempingPrice = 0;
                let purchasePrice = 0;
                let isActive = false;
                if (idxIsDemping !== -1) {
                    const val = (_f = row[idxIsDemping]) === null || _f === void 0 ? void 0 : _f.toString().toLowerCase().trim();
                    isDemping = val === 'да' || val === 'yes' || val === 'true';
                }
                if (idxIsActive !== -1) {
                    const val = (_g = row[idxIsActive]) === null || _g === void 0 ? void 0 : _g.toString().toLowerCase().trim();
                    isActive = val === 'да' || val === 'yes' || val === 'true';
                }
                if (idxDempingPrice !== -1) {
                    dempingPrice = Math.ceil(parseFloat(row[idxDempingPrice]) || 0);
                }
                if (idxPurchasePrice !== -1) {
                    purchasePrice = Math.ceil(parseFloat(row[idxPurchasePrice]) || 0);
                }
                let cityId;
                let isMain = false;
                const productCity = new product_item_price_city_dto_1.ProductItemPriceCityDto();
                if (hasCityColumn) {
                    const cityName = locationValue;
                    const city = storeCities.find((c) => c.cityName.replace(/\s+/g, '').toLowerCase() ===
                        cityName.replace(/\s+/g, '').toLowerCase());
                    cityId = city ? city.cityId : undefined;
                    if (!cityId &&
                        store.mainCity &&
                        store.mainCity.name.replace(/\s+/g, '').toLowerCase() ===
                            cityName.replace(/\s+/g, '').toLowerCase()) {
                        cityId = store.mainCity.id;
                        isMain = true;
                    }
                }
                else {
                    const warehouseName = locationValue;
                    const pickupPoint = pickupPoints.find((pp) => (pp.displayName || '').trim().toLowerCase() ===
                        warehouseName.trim().toLowerCase());
                    if (!pickupPoint) {
                        console.log(`[ExcelParser] Не найден склад по названию: '${warehouseName}' (SKU: ${sku})`);
                    }
                    else {
                        cityId = pickupPoint.cityId;
                        if (pickupPoint.cityId === ((_h = store.mainCity) === null || _h === void 0 ? void 0 : _h.id)) {
                            isMain = true;
                        }
                        productCity.storePickupPointId = pickupPoint._id.toString();
                    }
                }
                if (!cityId) {
                    console.log(`[ExcelParser] Не найден город/склад для значения '${locationValue}' (SKU: ${sku})`);
                    continue;
                }
                productCity.cityId = cityId;
                productCity.availableMinPrice = minPrice;
                productCity.availableMaxPrice = maxPrice;
                productCity.amount = amount;
                productCity.preOrder = preOrder;
                productCity.isMain = isMain;
                if (available !== undefined) {
                    productCity.available = available;
                }
                const key = sku + '___' + name;
                let productItem = skuMap.get(key);
                if (!productItem) {
                    productItem = new product_item_price_dto_1.ProductItemPriceDto();
                    productItem.name = name;
                    productItem.sku = sku;
                    productItem.cities = [];
                    productItem.price = price;
                    productItem.line = i;
                    productItem.isDemping = isDemping;
                    productItem.dempingPrice = dempingPrice;
                    productItem.purchasePrice = purchasePrice;
                    productItem.isActive = isActive;
                    skuMap.set(key, productItem);
                }
                productItem.cities.push(productCity);
            }
            for (const item of skuMap.values()) {
                result.push(item);
            }
        }
        else {
            let rowCount = 1;
            for (const row of sheet.data) {
                rowCount++;
                if (rowCount <= 3) {
                    continue;
                }
                if (row[1] !== 'SKU') {
                    if (row['length'] === 0) {
                        continue;
                    }
                    const newProductItem = new product_item_price_dto_1.ProductItemPriceDto();
                    const productItemCities = [];
                    newProductItem.cities = productItemCities;
                    newProductItem.name = (_j = row[0]) === null || _j === void 0 ? void 0 : _j.toString();
                    newProductItem.sku = (_k = row[1]) === null || _k === void 0 ? void 0 : _k.toString();
                    let column = 2;
                    const otherCities = [];
                    const mainCityItem = new product_item_price_city_dto_1.ProductItemPriceCityDto();
                    mainCityItem.isMain = true;
                    const minPrice = Math.ceil(parseFloat((_l = row[column++]) === null || _l === void 0 ? void 0 : _l.toString().trim()) || 0);
                    const maxPrice = Math.ceil(parseFloat((_m = row[column++]) === null || _m === void 0 ? void 0 : _m.toString().trim()) || 0);
                    const amount = Math.ceil(parseFloat((_o = row[column++]) === null || _o === void 0 ? void 0 : _o.toString().trim()) || 0);
                    const preOrder = Math.ceil(parseFloat((_p = row[column++]) === null || _p === void 0 ? void 0 : _p.toString().trim()) || 0);
                    mainCityItem.preOrder = preOrder;
                    mainCityItem.availableMinPrice = minPrice;
                    mainCityItem.availableMaxPrice = maxPrice;
                    mainCityItem.amount = amount;
                    mainCityItem.cityId = store.mainCity.id;
                    otherCities.push(mainCityItem);
                    for (let i = 0; i < storeCities.length; i++) {
                        const newProductItemCity = new product_item_price_city_dto_1.ProductItemPriceCityDto();
                        newProductItemCity.isMain = false;
                        newProductItemCity.availableMinPrice = Math.ceil(parseFloat((_q = row[column]) === null || _q === void 0 ? void 0 : _q.toString()) || 0);
                        newProductItemCity.availableMaxPrice = Math.ceil(parseFloat((_r = row[column + 1]) === null || _r === void 0 ? void 0 : _r.toString()) || 0);
                        newProductItemCity.amount = Math.ceil(parseFloat((_s = row[column + 2]) === null || _s === void 0 ? void 0 : _s.toString()) || 0);
                        newProductItemCity.cityId = storeCities[i].cityId;
                        newProductItemCity.preOrder = Math.ceil(parseFloat((_t = row[column + 3]) === null || _t === void 0 ? void 0 : _t.toString()) || 0);
                        column += 4;
                        otherCities.push(newProductItemCity);
                    }
                    const isDemping = ((_u = row[column++]) === null || _u === void 0 ? void 0 : _u.toString().toLowerCase().trim()) === 'да';
                    const dempingPrice = Math.ceil(parseFloat((_v = row[column++]) === null || _v === void 0 ? void 0 : _v.toString().trim()) || 0);
                    const purchasePrice = Math.ceil(parseFloat((_w = row[column++]) === null || _w === void 0 ? void 0 : _w.toString().trim()) || 0);
                    const currentPrice = Math.ceil(parseFloat((_x = row[column]) === null || _x === void 0 ? void 0 : _x.toString().trim()) || 0);
                    if (currentPrice) {
                        newProductItem.price = currentPrice;
                    }
                    newProductItem.isDemping = isDemping;
                    newProductItem.cities = otherCities;
                    newProductItem.dempingPrice = dempingPrice;
                    newProductItem.purchasePrice = purchasePrice;
                    newProductItem.line = rowCount - 1;
                    result.push(newProductItem);
                }
            }
        }
        return result;
    }
    async getKaspiPriceListHistory(storeId, page, limit = 20) {
        const totalCount = await this.storePriceListUploadModel.count({
            storeId,
        });
        const data = await this.storePriceListUploadModel.aggregate([
            {
                $match: {
                    storeId: new mongoose_1.Types.ObjectId(storeId),
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
        ]);
        return {
            totalCount,
            data,
        };
    }
    async getKaspiPriceListHistoryById(storeId, historyId) {
        const data = await this.storePriceListUploadModel.aggregate([
            {
                $match: {
                    storeId: new mongoose_1.Types.ObjectId(storeId),
                    _id: new mongoose_1.Types.ObjectId(historyId),
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
        ]);
        if (data.length === 0) {
            throw new common_1.NotFoundException();
        }
        return data[0];
    }
    async getProductUpdateHistories(storeId, historyId, page, filter, query) {
        const limit = 50;
        const matchQuery = {
            storePriceListUploadId: new mongoose_1.Types.ObjectId(historyId),
            storeId: new mongoose_1.Types.ObjectId(storeId),
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
        };
        if (filter === 'success') {
            matchQuery.status = 'SUCCESS';
        }
        else if (filter === 'product-not-found') {
            matchQuery.status = 'PRODUCT_NOT_FOUND';
        }
        else if (filter === 'invalid-format') {
            matchQuery.status = 'INVALID_FORMAT';
        }
        const totalCount = await this.storePriceListProductUpdateHistoryModel.count(matchQuery);
        const data = await this.storePriceListProductUpdateHistoryModel
            .find(matchQuery)
            .skip((page - 1) * limit)
            .limit(limit);
        return {
            totalCount,
            data,
        };
    }
};
WarehouseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_typegoose_1.InjectModel)(store_price_list_upload_model_1.StorePriceListUploadModel)),
    __param(1, (0, nestjs_typegoose_1.InjectModel)(price_list_example_mode_1.PriceListExampleModel)),
    __param(2, (0, nestjs_typegoose_1.InjectModel)(store_price_list_product_update_history_model_1.StorePriceListProductUpdateHistoryModel)),
    __param(3, (0, nestjs_typegoose_1.InjectModel)(kaspi_product_availability_on_pickup_point_model_1.KaspiProductAvailabilityOnPickupPointModel)),
    __param(4, (0, nestjs_typegoose_1.InjectModel)(kaspi_store_pickup_point_model_1.KaspiStorePickupPointModel)),
    __param(5, (0, nestjs_typegoose_1.InjectModel)(store_model_1.StoreModel)),
    __param(10, (0, bull_1.InjectQueue)('update-product-from-price-list-queue')),
    __param(11, (0, bull_1.InjectQueue)('load-specific-kaspi-product-queue')),
    __param(12, (0, bull_1.InjectQueue)('actualize-product-availabilites-and-settings-from-external-xml-queue')),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, product_service_1.ProductService,
        product_1.Product,
        store_service_1.StoreService,
        store_city_service_1.StoreCityService, Object, Object, Object])
], WarehouseService);
exports.WarehouseService = WarehouseService;
//# sourceMappingURL=warehouse.service.js.map