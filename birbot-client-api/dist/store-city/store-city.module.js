"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreCityModule = void 0;
const common_1 = require("@nestjs/common");
const store_city_service_1 = require("./store-city.service");
const store_city_controller_1 = require("./store-city.controller");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const store_city_model_1 = require("./store-city.model");
const store_module_1 = require("../store/store.module");
const product_city_model_1 = require("./product-city.model");
const product_module_1 = require("../product/product.module");
const bull_1 = require("@nestjs/bull");
const action_module_1 = require("../action/action.module");
const product_model_1 = require("../product/product.model");
const privileged_store_module_1 = require("../privileged-store/privileged-store.module");
let StoreCityModule = class StoreCityModule {
};
StoreCityModule = __decorate([
    (0, common_1.Module)({
        providers: [store_city_service_1.StoreCityService],
        controllers: [store_city_controller_1.StoreCityController],
        imports: [
            nestjs_typegoose_1.TypegooseModule.forFeature([
                {
                    typegooseClass: store_city_model_1.StoreCityModel,
                    schemaOptions: {
                        collection: 'StoreCity',
                    },
                },
                {
                    typegooseClass: product_city_model_1.ProductCityModel,
                    schemaOptions: {
                        collection: 'ProductCity',
                    },
                },
                {
                    typegooseClass: product_model_1.ProductModel,
                    schemaOptions: {
                        collection: 'Product',
                    },
                },
            ]),
            action_module_1.ActionModule,
            (0, common_1.forwardRef)(() => store_module_1.StoreModule),
            (0, common_1.forwardRef)(() => product_module_1.ProductModule),
            privileged_store_module_1.PrivilegedStoreModule,
            bull_1.BullModule.registerQueue({
                name: 'actualize-product-merchants-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'actualize-product-merchants-for-product-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'actualize-store-active-products-hash-queue'
            })
        ],
        exports: [store_city_service_1.StoreCityService],
    })
], StoreCityModule);
exports.StoreCityModule = StoreCityModule;
//# sourceMappingURL=store-city.module.js.map