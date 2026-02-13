"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KaspiAPIModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const kaspi_api_controller_1 = require("./kaspi-api.controller");
const kaspi_api_service_1 = require("./kaspi-api.service");
const kaspi_api_model_1 = require("./kaspi-api.model");
const payment_module_1 = require("../payment/payment.module");
const tariff_module_1 = require("../tariff/tariff.module");
let KaspiAPIModule = class KaspiAPIModule {
};
KaspiAPIModule = __decorate([
    (0, common_1.Module)({
        controllers: [kaspi_api_controller_1.kaspiAPIController],
        providers: [kaspi_api_service_1.KaspiAPIService],
        imports: [
            nestjs_typegoose_1.TypegooseModule.forFeature([
                {
                    typegooseClass: kaspi_api_model_1.KaspiAPIPaymentsModel,
                    schemaOptions: {
                        collection: 'KaspiAPIPayments',
                    },
                },
            ]),
            (0, common_1.forwardRef)(() => payment_module_1.PaymentModule),
            (0, common_1.forwardRef)(() => tariff_module_1.TariffModule),
        ],
        exports: [kaspi_api_service_1.KaspiAPIService],
    })
], KaspiAPIModule);
exports.KaspiAPIModule = KaspiAPIModule;
//# sourceMappingURL=kaspi-api.module.js.map