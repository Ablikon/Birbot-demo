import { Injectable } from '@nestjs/common'

@Injectable()
export class AnalyticsService {
    async calculateProfit(productCode: string, totalPrice: number) {
        return {
            delivery: [
                { priceWithNDS: 0 },
                { priceWithNDS: 0 },
                { priceWithNDS: 0 },
            ],
            comission: 0,
        }
    }

    async getProductBySku(sku: string) {
        return null
    }
}
