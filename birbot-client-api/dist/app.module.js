"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const app_service_1 = require("./app.service");
const mongo_config_1 = require("./configs/mongo.config");
const auth_module_1 = require("./auth/auth.module");
const user_module_1 = require("./user/user.module");
const store_module_1 = require("./store/store.module");
const product_module_1 = require("./product/product.module");
const order_module_1 = require("./order/order.module");
const store_city_module_1 = require("./store-city/store-city.module");
const city_module_1 = require("./city/city.module");
const kaspi_api_module_1 = require("./outside-kaspi-api/kaspi-api.module");
const kaspi_category_comission_module_1 = require("./kaspi-category-comission/kaspi-category-comission.module");
const price_history_module_1 = require("./price-history/price-history.module");
const warehouse_module_1 = require("./warehouse/warehouse.module");
const app_controller_1 = require("./app.controller");
const config_2 = require("@nestjs/config");
let AppModule = class AppModule {
};
AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            nestjs_typegoose_1.TypegooseModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_2.ConfigService],
                useFactory: mongo_config_1.getMainMongoConfig,
            }),
            nestjs_typegoose_1.TypegooseModule.forRootAsync({
                connectionName: 'analytics',
                imports: [config_1.ConfigModule],
                inject: [config_2.ConfigService],
                useFactory: mongo_config_1.getAnalyticsMongoConfig,
            }),
            nestjs_typegoose_1.TypegooseModule.forRootAsync({
                connectionName: 'tech',
                imports: [config_1.ConfigModule],
                inject: [config_2.ConfigService],
                useFactory: mongo_config_1.getTechMongoConfig,
            }),
            auth_module_1.AuthModule,
            user_module_1.UserModule,
            store_module_1.StoreModule,
            product_module_1.ProductModule,
            order_module_1.OrderModule,
            store_city_module_1.StoreCityModule,
            city_module_1.CityModule,
            kaspi_api_module_1.KaspiAPIModule,
            kaspi_category_comission_module_1.KaspiCategoryComissionModule,
            price_history_module_1.PriceHistoryModule,
            warehouse_module_1.WarehouseModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [app_service_1.AppService],
    })
], AppModule);
exports.AppModule = AppModule;
//# sourceMappingURL=app.module.js.map