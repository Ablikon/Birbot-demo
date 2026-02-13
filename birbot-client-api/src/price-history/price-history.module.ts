import { forwardRef, Module } from '@nestjs/common'
import { PriceHistoryService } from './price-history.service'
import { PriceHistoryController } from './price-history.controller'
import { TypegooseModule } from 'nestjs-typegoose'
import { PriceHistoryModel } from './price-history.model'
import { ProductModule } from 'src/product/product.module'
import { MessageModule } from 'src/message/message.module'
import { StoreModule } from 'src/store/store.module'
import { StoreCityModule } from 'src/store-city/store-city.module'

@Module({
    providers: [PriceHistoryService],
    controllers: [PriceHistoryController],
    imports: [
        TypegooseModule.forFeature(
            [
                {
                    typegooseClass: PriceHistoryModel,
                    schemaOptions: {
                        collection: 'PriceHistory',
                    },
                },
            ],
            'tech'
        ),
        forwardRef(() => ProductModule),
        MessageModule,
        forwardRef(() => StoreModule),
        forwardRef(() => StoreCityModule),
    ],
    exports: [PriceHistoryService],
})
export class PriceHistoryModule {}
