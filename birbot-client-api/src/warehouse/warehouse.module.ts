import { Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'
import { ActionModule } from 'src/action/action.module'
import { ProductModule } from 'src/product/product.module'
import { StoreCityModule } from 'src/store-city/store-city.module'
import { StoreSystemActionModule } from 'src/store-system-action/store-system-action.module'
import { StoreModule } from 'src/store/store.module'
import { UserModule } from 'src/user/user.module'
import { PriceListExampleModel } from './price-list-example.mode'
import { PriceListModel } from './price-list.model'
import { WarehouseController } from './warehouse.controller'
import { WarehouseService } from './warehouse.service'
import { StorePriceListUploadModel } from './store-price-list-upload.model'
import { BullModule } from '@nestjs/bull'
import { StorePriceListProductUpdateHistoryModel } from './store-price-list-product-update-history.model'
import { KaspiProductAvailabilityOnPickupPointModel } from 'src/product/kaspi-product-availability-on-pickup-point.model'
import { KaspiStorePickupPointModel } from 'src/store/kaspi-store-pickup-point.model'
import { StoreModel } from 'src/store/store.model'

@Module({
    controllers: [WarehouseController],
    providers: [WarehouseService],
    imports: [
        StoreModule,
        ProductModule,
        TypegooseModule.forFeature(
            [
                {
                    typegooseClass: StorePriceListUploadModel,
                    schemaOptions: {
                        collection: 'StorePriceListUpload',
                    },
                },
                {
                    typegooseClass: PriceListExampleModel,
                    schemaOptions: {
                        collection: 'PriceListExample',
                    },
                },
                {
                    typegooseClass: KaspiProductAvailabilityOnPickupPointModel,
                    schemaOptions: {
                        collection: 'KaspiProductAvailabilityOnPickupPoint',
                    },
                },
                {
                    typegooseClass: KaspiStorePickupPointModel,
                    schemaOptions: {
                        collection: 'KaspiStorePickupPointModel',
                    },
                },
                {
                    typegooseClass: StoreModel,
                    schemaOptions: {
                        collection: 'StoreModel',
                    },
                },
                {
                    typegooseClass: StorePriceListProductUpdateHistoryModel,
                    schemaOptions: {
                        collection: 'StorePriceListProductUpdateHistory',
                    },
                },
            ],
        
        ),
        BullModule.registerQueue({
            name: 'update-product-from-price-list-queue',
        }),
        BullModule.registerQueue({
            name: 'load-specific-kaspi-product-queue'
        }),
        BullModule.registerQueue({
            name: 'actualize-product-availabilites-and-settings-from-external-xml-queue'
        }),
        StoreCityModule,
        ActionModule,
        StoreSystemActionModule,
        UserModule,
    ],
})
export class WarehouseModule {}
