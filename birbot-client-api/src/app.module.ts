import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypegooseModule } from 'nestjs-typegoose'
import { AppService } from './app.service'
import { getAnalyticsMongoConfig, getMainMongoConfig, getTechMongoConfig } from './configs/mongo.config'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { StoreModule } from './store/store.module'
import { ProductModule } from './product/product.module'
import { OrderModule } from './order/order.module'
import { StoreCityModule } from './store-city/store-city.module'
import { CityModule } from './city/city.module'
import { KaspiAPIModule } from './outside-kaspi-api/kaspi-api.module'
import { KaspiCategoryComissionModule } from './kaspi-category-comission/kaspi-category-comission.module'
import { PriceHistoryModule } from './price-history/price-history.module'
import { WarehouseModule } from './warehouse/warehouse.module'
import { AppController } from './app.controller'
import { ConfigService } from '@nestjs/config';  // ADD THIS LINE

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypegooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getMainMongoConfig,
        }),
        TypegooseModule.forRootAsync({
            connectionName: 'analytics',
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getAnalyticsMongoConfig,
        }),
        TypegooseModule.forRootAsync({
            connectionName: 'tech',
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: getTechMongoConfig,
        }),
        AuthModule,
        UserModule,
        StoreModule,
        ProductModule,
        OrderModule,
        StoreCityModule,
        CityModule,
        KaspiAPIModule,
        KaspiCategoryComissionModule,
        PriceHistoryModule,
        WarehouseModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}