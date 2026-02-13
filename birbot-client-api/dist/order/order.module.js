"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderModule = void 0;
const common_1 = require("@nestjs/common");
const order_service_1 = require("./order.service");
const order_controller_1 = require("./order.controller");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const order_model_1 = require("./order.model");
const store_module_1 = require("../store/store.module");
const action_module_1 = require("../action/action.module");
const product_module_1 = require("../product/product.module");
const get_order_details_history_model_1 = require("./get-order-details-history.model");
const order_api_token_model_1 = require("./order-api-token.model");
const order_product_entry_model_1 = require("./order-product-entry.model");
const order_product_entry_image_model_1 = require("./order-product-entry-image.model");
const order_image_model_1 = require("./order-image.model");
const kaspi_store_pickup_point_model_1 = require("../store/kaspi-store-pickup-point.model");
const proxy_module_1 = require("../proxy/proxy.module");
const refund_model_1 = require("./refund.model");
const product_model_1 = require("../product/product.model");
const ss_tap_order_model_1 = require("./ss-tap-order.model");
const user_module_1 = require("../user/user.module");
const kaspi_category_comission_module_1 = require("../kaspi-category-comission/kaspi-category-comission.module");
const analytics_module_1 = require("../analytics/analytics.module");
let OrderModule = class OrderModule {
};
OrderModule = __decorate([
    (0, common_1.Module)({
        providers: [order_service_1.OrderService],
        controllers: [order_controller_1.OrderController],
        imports: [
            nestjs_typegoose_1.TypegooseModule.forFeature([
                {
                    typegooseClass: get_order_details_history_model_1.GetOrderDetailsModel,
                    schemaOptions: {
                        collection: 'GetOrderDetails',
                    },
                },
            ], 'tech'),
            nestjs_typegoose_1.TypegooseModule.forFeature([
                {
                    typegooseClass: order_product_entry_image_model_1.OrderProductEntryImageModel,
                    schemaOptions: {
                        collection: 'OrderProductEntryImage',
                    },
                },
                {
                    typegooseClass: order_image_model_1.OrderImageModel,
                    schemaOptions: {
                        collection: 'OrderImage',
                    },
                },
                {
                    typegooseClass: order_api_token_model_1.OrderApiTokenModel,
                    schemaOptions: {
                        collection: 'OrderApiToken',
                    },
                },
                {
                    typegooseClass: order_model_1.OrderModel,
                    schemaOptions: {
                        collection: 'Order',
                    },
                },
                {
                    typegooseClass: ss_tap_order_model_1.SSTapOrderModel,
                    schemaOptions: {
                        collection: 'SSTapOrder',
                    },
                },
                {
                    typegooseClass: kaspi_store_pickup_point_model_1.KaspiStorePickupPointModel,
                    schemaOptions: {
                        collection: 'KaspiStorePickupPoint',
                    },
                },
                {
                    typegooseClass: order_product_entry_model_1.OrderProductEntryModel,
                    schemaOptions: {
                        collection: 'OrderProductEntry',
                    },
                },
                {
                    typegooseClass: refund_model_1.RefundModel,
                    schemaOptions: {
                        collection: 'Refund',
                    },
                },
                {
                    typegooseClass: product_model_1.ProductModel,
                    schemaOptions: {
                        collection: 'Product',
                    },
                },
            ]),
            (0, common_1.forwardRef)(() => store_module_1.StoreModule),
            (0, common_1.forwardRef)(() => product_module_1.ProductModule),
            (0, common_1.forwardRef)(() => proxy_module_1.ProxyModule),
            action_module_1.ActionModule,
            kaspi_category_comission_module_1.KaspiCategoryComissionModule,
            (0, common_1.forwardRef)(() => analytics_module_1.AnalyticsModule),
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
        ],
        exports: [order_service_1.OrderService],
    })
], OrderModule);
exports.OrderModule = OrderModule;
//# sourceMappingURL=order.module.js.map