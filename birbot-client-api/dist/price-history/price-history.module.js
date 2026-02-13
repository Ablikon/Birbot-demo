"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PriceHistoryModule = void 0;
const common_1 = require("@nestjs/common");
const price_history_service_1 = require("./price-history.service");
const price_history_controller_1 = require("./price-history.controller");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const price_history_model_1 = require("./price-history.model");
const product_module_1 = require("../product/product.module");
const message_module_1 = require("../message/message.module");
const store_module_1 = require("../store/store.module");
const store_city_module_1 = require("../store-city/store-city.module");
let PriceHistoryModule = class PriceHistoryModule {
};
PriceHistoryModule = __decorate([
    (0, common_1.Module)({
        providers: [price_history_service_1.PriceHistoryService],
        controllers: [price_history_controller_1.PriceHistoryController],
        imports: [
            nestjs_typegoose_1.TypegooseModule.forFeature([
                {
                    typegooseClass: price_history_model_1.PriceHistoryModel,
                    schemaOptions: {
                        collection: 'PriceHistory',
                    },
                },
            ], 'tech'),
            (0, common_1.forwardRef)(() => product_module_1.ProductModule),
            message_module_1.MessageModule,
            (0, common_1.forwardRef)(() => store_module_1.StoreModule),
            (0, common_1.forwardRef)(() => store_city_module_1.StoreCityModule),
        ],
        exports: [price_history_service_1.PriceHistoryService],
    })
], PriceHistoryModule);
exports.PriceHistoryModule = PriceHistoryModule;
//# sourceMappingURL=price-history.module.js.map