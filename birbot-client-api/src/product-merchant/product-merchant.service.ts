import { Injectable } from '@nestjs/common'

@Injectable()
export class ProductMerchantService {
    async getProductMerchant(sku: string, cityId: string) {
        return { _id: null, sku, cityId, price: 0, masterProductSku: sku, productUrl: '', isX2Check: false }
    }
}
