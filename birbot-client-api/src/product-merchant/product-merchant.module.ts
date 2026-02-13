import { Module } from '@nestjs/common'
import { ProductMerchantService } from './product-merchant.service'

@Module({
    providers: [ProductMerchantService],
    exports: [ProductMerchantService],
})
export class ProductMerchantModule {}
