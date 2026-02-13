import { Module } from '@nestjs/common'
import { CityService } from './city.service'
import { CityController } from './city.controller'
import { TypegooseModule } from 'nestjs-typegoose'
import { MarketplaceCityModel } from './marketplace-city.model'

@Module({
    providers: [CityService],
    controllers: [CityController],
    imports: [
        TypegooseModule.forFeature(
            [
                {
                    typegooseClass: MarketplaceCityModel,
                    schemaOptions: {
                        collection: 'MarketplaceCity',
                    },
                },
            ],
        
        ),
    ],
    exports: [CityService, TypegooseModule],
})
export class CityModule {}
