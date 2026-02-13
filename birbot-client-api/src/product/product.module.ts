import { BullModule } from '@nestjs/bull'
import { forwardRef, Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypegooseModule } from 'nestjs-typegoose'
import { ActionModule } from 'src/action/action.module'
import { ProxyModule } from 'src/proxy/proxy.module'
import { StoreCityModule } from 'src/store-city/store-city.module'
import { StoreSystemActionModule } from 'src/store-system-action/store-system-action.module'
import { StoreModule } from 'src/store/store.module'
import { UserModule } from 'src/user/user.module'
import { ProductChangeModel } from './product-change.model'
import { BonusChangeModel } from './bonus-change.model'
import { ProductController } from './product.controller'
import { ProductModel } from './product.model'
import { ProductService } from './product.service'
import { Product } from './product'
import { KaspiProductAvailabilityOnPickupPointModel } from './kaspi-product-availability-on-pickup-point.model'
import { KaspiCategoryComissionModule } from 'src/kaspi-category-comission/kaspi-category-comission.module'
import { KaspiPromotionModule } from 'src/kaspi-promotion/kaspi-promotion.module'
import { ProductMerchantModule } from 'src/product-merchant/product-merchant.module'
import { MarketplaceModule } from 'src/marketplace/marketplace.module'
import { ProductDeliveryDurationModel } from './product-delivery-duration.model'
import { ProductMerchantModel } from 'src/product-merchant/product-merchant.model'
import { ProductCityModel } from 'src/store-city/product-city.model'
import { KaspiStorePickupPointModel } from '../store/kaspi-store-pickup-point.model'
import { ChangePriceRequestResultModel } from './change-price-request-result.model'
import { ApproveProductForSaleHistoryModel } from './approve-product-for-sale-history.model'
import { KaspiMarketingModel } from 'src/kaspi-marketing/kaspi-marketing.model'
import { KaspiMarketingModule } from 'src/kaspi-marketing/kaspi-marketing.module'
import { GoldLinkedProductModel } from './gold-linked-product.model'
import { AnalyticsModule } from 'src/analytics/analytics.module'
import { PrivilegedStoreModule } from 'src/privileged-store/privileged-store.module'
import { AnalyticsProductModel } from './analytics-product.model'
import { StoreModel } from 'src/store/store.model'

@Module({
    controllers: [ProductController],
    providers: [ProductService, Product],
    imports: [
        TypegooseModule.forFeature(
            [
                {
                    typegooseClass: ProductChangeModel,
                    schemaOptions: {
                        collection: 'ProductChangeStatistics',
                    },
                },
                {
                    typegooseClass: BonusChangeModel,
                    schemaOptions: {
                        collection: 'BonusChangeHistory',
                    },
                },
                {
                    typegooseClass: ProductModel,
                    schemaOptions: {
                        collection: 'Product',
                    },
                },
                {
                    typegooseClass: ProductCityModel,
                    schemaOptions: {
                        collection: 'ProductCity',
                    },
                },
                {
                    typegooseClass: KaspiProductAvailabilityOnPickupPointModel,
                    schemaOptions: {
                        collection: 'KaspiProductAvailabilityOnPickupPoint',
                    },
                },
                {
                    typegooseClass: ProductDeliveryDurationModel,
                    schemaOptions: {
                        collection: 'ProductDeliveryDuration',
                    },
                },
                {
                    typegooseClass: ProductMerchantModel,
                    schemaOptions: {
                        collection: 'ProductMerchants',
                    },
                },
                {
                    typegooseClass: KaspiStorePickupPointModel,
                    schemaOptions: {
                        collection: "KaspiStorePickupPoint"
                    }
                },
                {
                    typegooseClass: KaspiMarketingModel,
                    schemaOptions: {
                        collection: 'KaspiMarketing'
                    }
                },
                {
                    typegooseClass: GoldLinkedProductModel,
                    schemaOptions: {
                        collection: 'GoldLinkedProduct',
                    },
                },
            ],
        ),
        TypegooseModule.forFeature(
            [
                {
                    typegooseClass: ChangePriceRequestResultModel,
                    schemaOptions: {
                        collection: 'ChangePriceRequestResult',
                    },
                },
                {
                    typegooseClass: ApproveProductForSaleHistoryModel,
                    schemaOptions: {
                        collection: "ApproveProductForSaleHistory",
                    },
                },
            ],
            'tech'
        ),
        TypegooseModule.forFeature(
            [
                {
                    typegooseClass: AnalyticsProductModel,
                    schemaOptions: {
                        collection: 'Product',
                    },
                },
            ],
            'analytics'
        ),
        AnalyticsModule,
        ConfigModule,
        forwardRef(() => UserModule),
        forwardRef(() => ProxyModule),
        MarketplaceModule,
        forwardRef(() => StoreModule),
        forwardRef(() => StoreCityModule),
        forwardRef(() => KaspiMarketingModule),
        ActionModule,
        StoreSystemActionModule,
        PrivilegedStoreModule,
        KaspiCategoryComissionModule,
        KaspiPromotionModule,
        BullModule.registerQueue({
            name: 'bonus-product-status-changer-queue'
        }),
        BullModule.registerQueue({
            name: 'approve-or-withdraw-product-queue',
        }),
        BullModule.registerQueue({
            name: 'dumping-tasks-for-dump-manager-queue',
        }),
        BullModule.registerQueue({
            name: 'demping-tasks-for-product-changer-queue',
        }),
        BullModule.registerQueue({
            name: 'demping-tasks-for-product-changer-manager-queue',
        }),
        BullModule.registerQueue({
            name: 'actualize-product-merchants-for-product-queue',
        }),
        forwardRef(() => ProductMerchantModule),
        BullModule.registerQueue({
            name: 'demping-tasks-for-price-parser-with-super-high-priority-queue',
        }),
        BullModule.registerQueue({
            name: 'products-with-new-min-price-queue',
        }),
        BullModule.registerQueue({
            name: 'dumping-tasks-for-price-changer-queue',
        }),
        BullModule.registerQueue({
            name: 'change-product-price-manually-queue',
        }),
        BullModule.registerQueue({
            name : 'dumping-tasks-for-manually-price-change-manager-queue'
        }),
        BullModule.registerQueue({
            name : 'bonus-changer-queue'
        }),
        BullModule.registerQueue({
            name: 'loan-period-queue',
        }),
    ],
    exports: [ProductService, Product],
})
export class ProductModule {}
