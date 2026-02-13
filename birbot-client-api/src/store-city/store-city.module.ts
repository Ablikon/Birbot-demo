import { forwardRef, Module } from '@nestjs/common'
import { StoreCityService } from './store-city.service'
import { StoreCityController } from './store-city.controller'
import { TypegooseModule } from 'nestjs-typegoose'
import { StoreCityModel } from './store-city.model'
import { StoreModule } from 'src/store/store.module'
import { ProductCityModel } from './product-city.model'
import { ProductModule } from 'src/product/product.module'
import { BullModule } from '@nestjs/bull'
import { ActionModule } from 'src/action/action.module'
import { ProductModel } from 'src/product/product.model'
import { PrivilegedStoreModule } from 'src/privileged-store/privileged-store.module'

@Module({
    providers: [StoreCityService],
    controllers: [StoreCityController],
    imports: [
        TypegooseModule.forFeature(
            [
                {
                    typegooseClass: StoreCityModel,
                    schemaOptions: {
                        collection: 'StoreCity',
                    },
                },
                {
                    typegooseClass: ProductCityModel,
                    schemaOptions: {
                        collection: 'ProductCity',
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
        ActionModule,
        forwardRef(() => StoreModule),
        forwardRef(() => ProductModule),
        PrivilegedStoreModule,
        BullModule.registerQueue({
            name: 'actualize-product-merchants-queue',
        }),
        BullModule.registerQueue({
            name: 'actualize-product-merchants-for-product-queue',
        }),
        BullModule.registerQueue({
            name: 'actualize-store-active-products-hash-queue'
        })
    ],
    exports: [StoreCityService],
})
export class StoreCityModule {}
