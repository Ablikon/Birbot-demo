import { forwardRef, Module } from '@nestjs/common'
import { OrderService } from './order.service'
import { OrderController } from './order.controller'
import { TypegooseModule } from 'nestjs-typegoose'
import { OrderModel } from './order.model'
import { StoreModule } from 'src/store/store.module'
import { ActionModule } from 'src/action/action.module'
import { ProductModule } from 'src/product/product.module'
import { GetOrderDetailsModel } from './get-order-details-history.model'
import { OrderApiTokenModel } from './order-api-token.model'
import { OrderProductEntryModel } from './order-product-entry.model'
import { OrderProductEntryImageModel } from './order-product-entry-image.model'
import { OrderImageModel } from './order-image.model'
import { KaspiStorePickupPointModel } from 'src/store/kaspi-store-pickup-point.model'
import { ProxyModule } from 'src/proxy/proxy.module'
import { RefundModel } from './refund.model'
import { ProductModel } from 'src/product/product.model'
import { SSTapOrderModel } from './ss-tap-order.model'
import { UserModule } from 'src/user/user.module'
import { KaspiCategoryComissionModule } from '../kaspi-category-comission/kaspi-category-comission.module'
import { AnalyticsModule } from 'src/analytics/analytics.module'

@Module({
    providers: [OrderService],
    controllers: [OrderController],
    imports: [
        TypegooseModule.forFeature(
            [
                {
                    typegooseClass: GetOrderDetailsModel,
                    schemaOptions: {
                        collection: 'GetOrderDetails',
                    },
                },
            ],
            'tech'
        ),
        TypegooseModule.forFeature(
            [
                {
                    typegooseClass: OrderProductEntryImageModel,
                    schemaOptions: {
                        collection: 'OrderProductEntryImage',
                    },
                },
                {
                    typegooseClass: OrderImageModel,
                    schemaOptions: {
                        collection: 'OrderImage',
                    },
                },
                {
                    typegooseClass: OrderApiTokenModel,
                    schemaOptions: {
                        collection: 'OrderApiToken',
                    },
                },
                {
                    typegooseClass: OrderModel,
                    schemaOptions: {
                        collection: 'Order',
                    },
                },
                {
                    typegooseClass: SSTapOrderModel,
                    schemaOptions: {
                        collection: 'SSTapOrder',
                    },
                },
                {
                    typegooseClass: KaspiStorePickupPointModel,
                    schemaOptions: {
                        collection: 'KaspiStorePickupPoint',
                    },
                },
                {
                    typegooseClass: OrderProductEntryModel,
                    schemaOptions: {
                        collection: 'OrderProductEntry',
                    },
                },
                {
                    typegooseClass: RefundModel,
                    schemaOptions: {
                        collection: 'Refund',
                    },
                },
                {
                    typegooseClass: ProductModel,
                    schemaOptions: {
                        collection: 'Product',
                    },
                },
            ],
        ),
        forwardRef(() => StoreModule),
        forwardRef(() => ProductModule),
        forwardRef(() => ProxyModule),
        ActionModule,
        KaspiCategoryComissionModule,
        forwardRef(() => AnalyticsModule),
        forwardRef(() => UserModule),
    ],
    exports: [OrderService],
})
export class OrderModule {}
