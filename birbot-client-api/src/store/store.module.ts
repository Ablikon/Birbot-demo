import { forwardRef, Module } from '@nestjs/common'
import { StoreService } from './store.service'
import { StoreController } from './store.controller'
import { UserModule } from 'src/user/user.module'
import { ProxyModule } from 'src/proxy/proxy.module'
import { StoreModel } from './store.model'
import { StoreWAModel } from '../store-wa/store-wa.model'
import { TypegooseModule } from 'nestjs-typegoose'
import { MarketplaceModule } from 'src/marketplace/marketplace.module'
import { StoreCityModule } from 'src/store-city/store-city.module'
import { KaspiService } from './kaspi.service'
import { OrderModule } from 'src/order/order.module'
import { ProductModule } from 'src/product/product.module'
import { PriceHistoryModule } from 'src/price-history/price-history.module'
import { StoreStatisticsModel } from './store-statistics.model'
import { StoreFinishModel } from './store-finish.model'
import { StoreV2Service } from './store-v2.service'
import { StoreV2Controller } from './store-v2.controller'

import { ActionModule } from 'src/action/action.module'
import { ProductLoadQueueModel } from './product-load-queue.model'
import { ProductLoadQueueMessageModel } from './product-load-queue-message.model'
import { ProductLoadQueueSumModel } from './product-load-queue-sum.model'
import { StoreWaModule } from 'src/store-wa/store-wa.module'
import { DidNotRenewTheSubscriptionModel } from './did-not-renew-the-subscription.model'
import { BullModule } from '@nestjs/bull'
import { CityModule } from 'src/city/city.module'
import { KaspiStorePickupPointModel } from './kaspi-store-pickup-point.model'
import { StorePositionMetricsModel } from './store-position-metrics.model'
import { StoreStateHistoryModel } from './store-state-history.model'
import { KaspiStoreUploadLimitModel } from './store-upload-limit.model'
import { PaymentModel } from 'src/payment/payment.model'
import { XmlUploadHistoryModel } from './xml-upload-history.model'
import { OrderLoadQueueModel } from './order-load-queue.model'
import { OrderLoadQueueMessageModel } from './order-load-queue-message.model'
import { OrderLoadQueueSumModel } from './order-load-queue-sum.model'
import { AnalyticsModule } from 'src/analytics/analytics.module'
import { IntegrationModel } from './integration.model'
import { MarketplaceCityModel } from 'src/city/marketplace-city.model'

@Module({
    providers: [StoreService, KaspiService, StoreV2Service,],
    controllers: [StoreController, StoreV2Controller],
    imports: [
        TypegooseModule.forFeature(
            [
                {
                    typegooseClass: StoreStateHistoryModel,
                    schemaOptions: {
                        collection: 'StoreStateHistory',
                    },
                },
                {
                    typegooseClass: XmlUploadHistoryModel,
                    schemaOptions: {
                        collection: 'XmlUploadHistory',
                    },
                }
            ],
            'tech'
        ),
        TypegooseModule.forFeature(
            [
                {
                    typegooseClass: StoreModel,
                    schemaOptions: {
                        collection: 'Store',
                    },
                },
                {
                    typegooseClass: PaymentModel,
                    schemaOptions: {
                        collection: 'Payment',
                    },
                },
                {
                    typegooseClass: StoreWAModel,
                    schemaOptions: {
                        collection: 'StoreWa',
                    },
                },
                {
                    typegooseClass: KaspiStorePickupPointModel,
                    schemaOptions: {
                        collection: 'KaspiStorePickupPoint',
                    },
                },
                {
                    typegooseClass: StoreStatisticsModel,
                    schemaOptions: {
                        collection: 'StoreStatistics',
                    },
                },
                {
                    typegooseClass: StoreFinishModel,
                    schemaOptions: {
                        collection: 'FinishedTimes',
                    },
                },
                {
                    typegooseClass: ProductLoadQueueModel,
                    schemaOptions: {
                        collection: 'ProductLoadQueue',
                    },
                },
                {
                    typegooseClass: ProductLoadQueueMessageModel,
                    schemaOptions: {
                        collection: 'ProductLoadQueueMessage',
                    },
                },
                {
                    typegooseClass: ProductLoadQueueSumModel,
                    schemaOptions: {
                        collection: 'ProductLoadQueueSum',
                    },
                },                {
                    typegooseClass: OrderLoadQueueModel,
                    schemaOptions: {
                        collection: 'OrderLoadQueue',
                    },
                },
                {
                    typegooseClass: OrderLoadQueueMessageModel,
                    schemaOptions: {
                        collection: 'OrderLoadQueueMessage',
                    },
                },
                {
                    typegooseClass: OrderLoadQueueSumModel,
                    schemaOptions: {
                        collection: 'OrderLoadQueueSum',
                    },
                },
                {
                    typegooseClass: DidNotRenewTheSubscriptionModel,
                    schemaOptions: {
                        collection: 'DidNotRenewTheSubscription',
                    },
                },
                {
                    typegooseClass: StorePositionMetricsModel,
                    schemaOptions: {
                        collection: 'StorePositionMetrics',
                    },
                },
                {
                    typegooseClass: IntegrationModel,
                    schemaOptions: {
                        collection: 'Integration',
                    },
                },
                {
                    typegooseClass: KaspiStoreUploadLimitModel,
                    schemaOptions: {
                        collection: 'KaspiStoreUploadLimit',
                    },
                },
                {
                    typegooseClass: MarketplaceCityModel,
                    schemaOptions: {
                        collection: 'MarketplaceCity',
                    },
                },
            ],
        ),
        AnalyticsModule,
        UserModule,
        ProxyModule,
        MarketplaceModule,
        
        forwardRef(() => StoreCityModule),
        forwardRef(() => OrderModule),
        forwardRef(() => ProductModule),
        forwardRef(() => PriceHistoryModule),
        
        ActionModule,
        StoreWaModule,
        BullModule.registerQueue({
            name: 'load-products-queue',
        }),
        CityModule,
        BullModule.registerQueue({
            name: 'get-kaspi-store-api-token-queue',
        }),
        BullModule.registerQueue({
            name: 'actualize-product-merchants-for-product-queue',
        }),
        BullModule.registerQueue({
            name: 'load-kaspi-active-products-client-queue',
        }),
        BullModule.registerQueue({
            name: 'load-kaspi-active-products-by-xml-queue',
        }),
        BullModule.registerQueue({
            name: 'load-kaspi-archive-products-by-xml-queue',
        }),
        BullModule.registerQueue({
            name: 'load-kaspi-archive-products-queue',
        }),
       
        
        BullModule.registerQueue({
            name: 'actualize-product-merchants-queue',
        }),
        BullModule.registerQueue({
            name: 'actualize-kaspi-store-pickup-points-queue',
        }),
        BullModule.registerQueue({
            name: 'actualize-kaspi-store-cities-queue',
        }),
        BullModule.registerQueue({
            name: 'load-products-from-xml-queue',
        }),
        BullModule.registerQueue({
            name: "clear-xml-hash-and-xml-hash-sum-for-store-queue",
        }),
        BullModule.registerQueue({
            name: "actualize-store-active-products-hash-queue",
        }),
        BullModule.registerQueue({
            name: 'load-kaspi-orders-queue',
        }),
       
    ],
    exports: [StoreService, KaspiService],
})
export class StoreModule {}
