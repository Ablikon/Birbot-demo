import { Module } from '@nestjs/common'
import { KaspiPromotionService } from './kaspi-promotion.service'

@Module({
    providers: [KaspiPromotionService],
    exports: [KaspiPromotionService],
})
export class KaspiPromotionModule {}
