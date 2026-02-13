"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreModule = void 0;
const common_1 = require("@nestjs/common");
const store_service_1 = require("./store.service");
const store_controller_1 = require("./store.controller");
const user_module_1 = require("../user/user.module");
const proxy_module_1 = require("../proxy/proxy.module");
const store_model_1 = require("./store.model");
const store_wa_model_1 = require("../store-wa/store-wa.model");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const marketplace_module_1 = require("../marketplace/marketplace.module");
const store_city_module_1 = require("../store-city/store-city.module");
const kaspi_service_1 = require("./kaspi.service");
const order_module_1 = require("../order/order.module");
const product_module_1 = require("../product/product.module");
const price_history_module_1 = require("../price-history/price-history.module");
const store_statistics_model_1 = require("./store-statistics.model");
const store_finish_model_1 = require("./store-finish.model");
const store_v2_service_1 = require("./store-v2.service");
const store_v2_controller_1 = require("./store-v2.controller");
const action_module_1 = require("../action/action.module");
const product_load_queue_model_1 = require("./product-load-queue.model");
const product_load_queue_message_model_1 = require("./product-load-queue-message.model");
const product_load_queue_sum_model_1 = require("./product-load-queue-sum.model");
const store_wa_module_1 = require("../store-wa/store-wa.module");
const did_not_renew_the_subscription_model_1 = require("./did-not-renew-the-subscription.model");
const bull_1 = require("@nestjs/bull");
const city_module_1 = require("../city/city.module");
const kaspi_store_pickup_point_model_1 = require("./kaspi-store-pickup-point.model");
const store_position_metrics_model_1 = require("./store-position-metrics.model");
const store_state_history_model_1 = require("./store-state-history.model");
const store_upload_limit_model_1 = require("./store-upload-limit.model");
const payment_model_1 = require("../payment/payment.model");
const xml_upload_history_model_1 = require("./xml-upload-history.model");
const order_load_queue_model_1 = require("./order-load-queue.model");
const order_load_queue_message_model_1 = require("./order-load-queue-message.model");
const order_load_queue_sum_model_1 = require("./order-load-queue-sum.model");
const analytics_module_1 = require("../analytics/analytics.module");
const integration_model_1 = require("./integration.model");
const marketplace_city_model_1 = require("../city/marketplace-city.model");
let StoreModule = class StoreModule {
};
StoreModule = __decorate([
    (0, common_1.Module)({
        providers: [store_service_1.StoreService, kaspi_service_1.KaspiService, store_v2_service_1.StoreV2Service,],
        controllers: [store_controller_1.StoreController, store_v2_controller_1.StoreV2Controller],
        imports: [
            nestjs_typegoose_1.TypegooseModule.forFeature([
                {
                    typegooseClass: store_state_history_model_1.StoreStateHistoryModel,
                    schemaOptions: {
                        collection: 'StoreStateHistory',
                    },
                },
                {
                    typegooseClass: xml_upload_history_model_1.XmlUploadHistoryModel,
                    schemaOptions: {
                        collection: 'XmlUploadHistory',
                    },
                }
            ], 'tech'),
            nestjs_typegoose_1.TypegooseModule.forFeature([
                {
                    typegooseClass: store_model_1.StoreModel,
                    schemaOptions: {
                        collection: 'Store',
                    },
                },
                {
                    typegooseClass: payment_model_1.PaymentModel,
                    schemaOptions: {
                        collection: 'Payment',
                    },
                },
                {
                    typegooseClass: store_wa_model_1.StoreWAModel,
                    schemaOptions: {
                        collection: 'StoreWa',
                    },
                },
                {
                    typegooseClass: kaspi_store_pickup_point_model_1.KaspiStorePickupPointModel,
                    schemaOptions: {
                        collection: 'KaspiStorePickupPoint',
                    },
                },
                {
                    typegooseClass: store_statistics_model_1.StoreStatisticsModel,
                    schemaOptions: {
                        collection: 'StoreStatistics',
                    },
                },
                {
                    typegooseClass: store_finish_model_1.StoreFinishModel,
                    schemaOptions: {
                        collection: 'FinishedTimes',
                    },
                },
                {
                    typegooseClass: product_load_queue_model_1.ProductLoadQueueModel,
                    schemaOptions: {
                        collection: 'ProductLoadQueue',
                    },
                },
                {
                    typegooseClass: product_load_queue_message_model_1.ProductLoadQueueMessageModel,
                    schemaOptions: {
                        collection: 'ProductLoadQueueMessage',
                    },
                },
                {
                    typegooseClass: product_load_queue_sum_model_1.ProductLoadQueueSumModel,
                    schemaOptions: {
                        collection: 'ProductLoadQueueSum',
                    },
                }, {
                    typegooseClass: order_load_queue_model_1.OrderLoadQueueModel,
                    schemaOptions: {
                        collection: 'OrderLoadQueue',
                    },
                },
                {
                    typegooseClass: order_load_queue_message_model_1.OrderLoadQueueMessageModel,
                    schemaOptions: {
                        collection: 'OrderLoadQueueMessage',
                    },
                },
                {
                    typegooseClass: order_load_queue_sum_model_1.OrderLoadQueueSumModel,
                    schemaOptions: {
                        collection: 'OrderLoadQueueSum',
                    },
                },
                {
                    typegooseClass: did_not_renew_the_subscription_model_1.DidNotRenewTheSubscriptionModel,
                    schemaOptions: {
                        collection: 'DidNotRenewTheSubscription',
                    },
                },
                {
                    typegooseClass: store_position_metrics_model_1.StorePositionMetricsModel,
                    schemaOptions: {
                        collection: 'StorePositionMetrics',
                    },
                },
                {
                    typegooseClass: integration_model_1.IntegrationModel,
                    schemaOptions: {
                        collection: 'Integration',
                    },
                },
                {
                    typegooseClass: store_upload_limit_model_1.KaspiStoreUploadLimitModel,
                    schemaOptions: {
                        collection: 'KaspiStoreUploadLimit',
                    },
                },
                {
                    typegooseClass: marketplace_city_model_1.MarketplaceCityModel,
                    schemaOptions: {
                        collection: 'MarketplaceCity',
                    },
                },
            ]),
            analytics_module_1.AnalyticsModule,
            user_module_1.UserModule,
            proxy_module_1.ProxyModule,
            marketplace_module_1.MarketplaceModule,
            (0, common_1.forwardRef)(() => store_city_module_1.StoreCityModule),
            (0, common_1.forwardRef)(() => order_module_1.OrderModule),
            (0, common_1.forwardRef)(() => product_module_1.ProductModule),
            (0, common_1.forwardRef)(() => price_history_module_1.PriceHistoryModule),
            action_module_1.ActionModule,
            store_wa_module_1.StoreWaModule,
            bull_1.BullModule.registerQueue({
                name: 'load-products-queue',
            }),
            city_module_1.CityModule,
            bull_1.BullModule.registerQueue({
                name: 'get-kaspi-store-api-token-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'actualize-product-merchants-for-product-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'load-kaspi-active-products-client-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'load-kaspi-active-products-by-xml-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'load-kaspi-archive-products-by-xml-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'load-kaspi-archive-products-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'actualize-product-merchants-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'actualize-kaspi-store-pickup-points-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'actualize-kaspi-store-cities-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: 'load-products-from-xml-queue',
            }),
            bull_1.BullModule.registerQueue({
                name: "clear-xml-hash-and-xml-hash-sum-for-store-queue",
            }),
            bull_1.BullModule.registerQueue({
                name: "actualize-store-active-products-hash-queue",
            }),
            bull_1.BullModule.registerQueue({
                name: 'load-kaspi-orders-queue',
            }),
        ],
        exports: [store_service_1.StoreService, kaspi_service_1.KaspiService],
    })
], StoreModule);
exports.StoreModule = StoreModule;
//# sourceMappingURL=store.module.js.map