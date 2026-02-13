"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductModule = void 0;
const bull_1 = require("@nestjs/bull");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const action_module_1 = require("../action/action.module");
const proxy_module_1 = require("../proxy/proxy.module");
const store_city_module_1 = require("../store-city/store-city.module");
const store_system_action_module_1 = require("../store-system-action/store-system-action.module");
const store_module_1 = require("../store/store.module");
const user_module_1 = require("../user/user.module");
const product_change_model_1 = require("./product-change.model");
const bonus_change_model_1 = require("./bonus-change.model");
const product_controller_1 = require("./product.controller");
const product_model_1 = require("./product.model");
const product_service_1 = require("./product.service");
const product_1 = require("./product");
const kaspi_product_availability_on_pickup_point_model_1 = require("./kaspi-product-availability-on-pickup-point.model");
const kaspi_category_comission_module_1 = require("../kaspi-category-comission/kaspi-category-comission.module");
const kaspi_promotion_module_1 = require("../kaspi-promotion/kaspi-promotion.module");
const product_merchant_module_1 = require("../product-merchant/product-merchant.module");
const marketplace_module_1 = require("../marketplace/marketplace.module");
const product_delivery_duration_model_1 = require("./product-delivery-duration.model");
const product_merchant_model_1 = require("../product-merchant/product-merchant.model");
const product_city_model_1 = require("../store-city/product-city.model");
const kaspi_store_pickup_point_model_1 = require("../store/kaspi-store-pickup-point.model");
const change_price_request_result_model_1 = require("./change-price-request-result.model");
const approve_product_for_sale_history_model_1 = require("./approve-product-for-sale-history.model");
const kaspi_marketing_model_1 = require("../kaspi-marketing/kaspi-marketing.model");
const kaspi_marketing_module_1 = require("../kaspi-marketing/kaspi-marketing.module");
const gold_linked_product_model_1 = require("./gold-linked-product.model");
const analytics_module_1 = require("../analytics/analytics.module");
const privileged_store_module_1 = require("../privileged-store/privileged-store.module");
const analytics_product_model_1 = require("./analytics-product.model");
let ProductModule = class ProductModule {
};
ProductModule = __decorate([
    (0, common_1.Module)({
        controllers: [product_controller_1.ProductController],
        providers: [product_service_1.ProductService, product_1.Product],
        imports: [
            nestjs_typegoose_1.TypegooseModule.forFeature([
                {
                    typegooseClass: product_change_model_1.ProductChangeModel,
                    schemaOptions: {
                        collection: 'ProductChangeStatistics',
                    },
                },
                {
                    typegooseClass: bonus_change_model_1.BonusChangeModel,
                    schemaOptions: {
                        collection: 'BonusChangeHistory',
                    },
                },
                {
                    typegooseClass: product_model_1.ProductModel,
                    schemaOptions: {
                        collection: 'Product',
                    },
                },
                {
                    typegooseClass: product_city_model_1.ProductCityModel,
                    schemaOptions: {
                        collection: 'ProductCity',
                    },
                },
                {
                    typegooseClass: kaspi_product_availability_on_pickup_point_model_1.KaspiProductAvailabilityOnPickupPointModel,
                    schemaOptions: {
                        collection: 'KaspiProductAvailabilityOnPickupPoint',
                    },
                },
                {
                    typegooseClass: product_delivery_duration_model_1.ProductDeliveryDurationModel,
                    schemaOptions: {
                        collection: 'ProductDeliveryDuration',
                    },
                },
                {
                    typegooseClass: product_merchant_model_1.ProductMerchantModel,
                    schemaOptions: {
                        collection: 'ProductMerchants',
                    },
                },
                {
                    typegooseClass: kaspi_store_pickup_point_model_1.KaspiStorePickupPointModel,
                    schemaOptions: {
                        collection: "KaspiStorePickupPoint"
                    }
                },
                {
                    typegooseClass: kaspi_marketing_model_1.KaspiMarketingModel,
                    schemaOptions: {
                        collection: 'KaspiMarketing'
                    }
                },
                {
                    typegooseClass: gold_linked_product_model_1.GoldLinkedProductModel,
                    schemaOptions: {
                        collection: 'GoldLinkedProduct',
                    },
                },
            ]),
            nestjs_typegoose_1.TypegooseModule.forFeature([
                {
                    typegooseClass: change_price_request_result_model_1.ChangePriceRequestResultModel,
                    schemaOptions: {
                        collection: 'ChangePriceRequestResult',
                    },
                },
                {
                    typegooseClass: approve_product_for_sale_history_model_1.ApproveProductForSaleHistoryModel,
                    schemaOptions: {
                        collection: "ApproveProductForSaleHistory",
                    },
                },
            ], 'tech'),
            nestjs_typegoose_1.TypegooseModule.forFeature([
                {
                    typegooseClass: analytics_product_model_1.AnalyticsProductModel,
                    schemaOptions: {
                        collection: 'Product',
                    },
                },
            ], 'analytics'),
            analytics_module_1.AnalyticsModule,
            config_1.ConfigModule,
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            (0, common_1.forwardRef)(() => proxy_module_1.ProxyModule),
            marketplace_module_1.MarketplaceModule,
            (0, common_1.forwardRef)(() => store_module_1.StoreModule),
            (0, common_1.forwardRef)(() => store_city_module_1.StoreCityModule),
            (0, common_1.forwardRef)(() => kaspi_marketing_module_1.KaspiMarketingModule),
            action_module_1.ActionModule,
            store_system_action_module_1.StoreSystemActionModule,
            privileged_store_module_1.PrivilegedStoreModule,
            kaspi_category_comission_module_1.KaspiCategoryComissionModule,
            kaspi_promotion_module_1.KaspiPromotionModule,
            bull_1.BullModule.registerQueue({
                name: 'bonus-product-status-changer-queue'
            }),
            bull_1.BullModule.registerQueue({
                name: 'approve-or-withdraw-product-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'dumping-tasks-for-dump-manager-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'demping-tasks-for-product-changer-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'demping-tasks-for-product-changer-manager-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'actualize-product-merchants-for-product-queue',
            }),
            (0, common_1.forwardRef)(() => product_merchant_module_1.ProductMerchantModule),
            bull_1.BullModule.registerQueue({
                name: 'demping-tasks-for-price-parser-with-super-high-priority-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'products-with-new-min-price-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'dumping-tasks-for-price-changer-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'change-product-price-manually-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'dumping-tasks-for-manually-price-change-manager-queue'
            }),
            bull_1.BullModule.registerQueue({
                name: 'bonus-changer-queue'
            }),
            bull_1.BullModule.registerQueue({
                name: 'loan-period-queue',
            }),
        ],
        exports: [product_service_1.ProductService, product_1.Product],
    })
], ProductModule);
exports.ProductModule = ProductModule;
//# sourceMappingURL=product.module.js.map