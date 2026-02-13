import { Module } from '@nestjs/common'
import { KaspiMarketingService } from './kaspi-marketing.service'

@Module({
    providers: [KaspiMarketingService],
    exports: [KaspiMarketingService],
})
export class KaspiMarketingModule {}
