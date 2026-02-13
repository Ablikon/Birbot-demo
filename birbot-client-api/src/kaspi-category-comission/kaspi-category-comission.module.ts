import { Module } from '@nestjs/common'
import { KaspiCategoryComissionService } from './kaspi-category-comission.service'
import { TypegooseModule } from 'nestjs-typegoose'
import { KaspiCategoryComissionModel } from './kaspi-category-comission.model'

@Module({
    providers: [KaspiCategoryComissionService],
    imports: [
        TypegooseModule.forFeature(
            [
                {
                    typegooseClass: KaspiCategoryComissionModel,
                    schemaOptions: {
                        collection: 'KaspiCategoryNewComission',
                    },
                },
            ],
        
        ),
    ],
    exports: [KaspiCategoryComissionService],
})
export class KaspiCategoryComissionModule {}
