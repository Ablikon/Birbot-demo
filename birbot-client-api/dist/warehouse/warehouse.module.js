"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WarehouseModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const action_module_1 = require("../action/action.module");
const product_module_1 = require("../product/product.module");
const store_city_module_1 = require("../store-city/store-city.module");
const store_system_action_module_1 = require("../store-system-action/store-system-action.module");
const store_module_1 = require("../store/store.module");
const user_module_1 = require("../user/user.module");
const price_list_example_mode_1 = require("./price-list-example.mode");
const warehouse_controller_1 = require("./warehouse.controller");
const warehouse_service_1 = require("./warehouse.service");
const store_price_list_upload_model_1 = require("./store-price-list-upload.model");
const bull_1 = require("@nestjs/bull");
const store_price_list_product_update_history_model_1 = require("./store-price-list-product-update-history.model");
const kaspi_product_availability_on_pickup_point_model_1 = require("../product/kaspi-product-availability-on-pickup-point.model");
const kaspi_store_pickup_point_model_1 = require("../store/kaspi-store-pickup-point.model");
const store_model_1 = require("../store/store.model");
let WarehouseModule = class WarehouseModule {
};
WarehouseModule = __decorate([
    (0, common_1.Module)({
        controllers: [warehouse_controller_1.WarehouseController],
        providers: [warehouse_service_1.WarehouseService],
        imports: [
            store_module_1.StoreModule,
            product_module_1.ProductModule,
            nestjs_typegoose_1.TypegooseModule.forFeature([
                {
                    typegooseClass: store_price_list_upload_model_1.StorePriceListUploadModel,
                    schemaOptions: {
                        collection: 'StorePriceListUpload',
                    },
                },
                {
                    typegooseClass: price_list_example_mode_1.PriceListExampleModel,
                    schemaOptions: {
                        collection: 'PriceListExample',
                    },
                },
                {
                    typegooseClass: kaspi_product_availability_on_pickup_point_model_1.KaspiProductAvailabilityOnPickupPointModel,
                    schemaOptions: {
                        collection: 'KaspiProductAvailabilityOnPickupPoint',
                    },
                },
                {
                    typegooseClass: kaspi_store_pickup_point_model_1.KaspiStorePickupPointModel,
                    schemaOptions: {
                        collection: 'KaspiStorePickupPointModel',
                    },
                },
                {
                    typegooseClass: store_model_1.StoreModel,
                    schemaOptions: {
                        collection: 'StoreModel',
                    },
                },
                {
                    typegooseClass: store_price_list_product_update_history_model_1.StorePriceListProductUpdateHistoryModel,
                    schemaOptions: {
                        collection: 'StorePriceListProductUpdateHistory',
                    },
                },
            ]),
            bull_1.BullModule.registerQueue({
                name: 'update-product-from-price-list-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'load-specific-kaspi-product-queue'
            }),
            bull_1.BullModule.registerQueue({
                name: 'actualize-product-availabilites-and-settings-from-external-xml-queue'
            }),
            store_city_module_1.StoreCityModule,
            action_module_1.ActionModule,
            store_system_action_module_1.StoreSystemActionModule,
            user_module_1.UserModule,
        ],
    })
], WarehouseModule);
exports.WarehouseModule = WarehouseModule;
//# sourceMappingURL=warehouse.module.js.map