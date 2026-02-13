import { Injectable } from '@nestjs/common'

@Injectable()
export class KaspiMarketingService {
    async isDempingAvailable(sku: string, cityId: string): Promise<boolean> {
        return true
    }
}
