import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { MessageService } from 'src/message/message.service'
import { PRODUCT_NOT_FOUND_ERROR } from 'src/product/product.constant'
import { ProductService } from 'src/product/product.service'
import { StoreCityService } from 'src/store-city/store-city.service'
import { STORE_NOT_FOUND_ERROR } from 'src/store/store.constants'
import { StoreService } from 'src/store/store.service'
import { PriceHistoryModel } from './price-history.model'
import { Types, isValidObjectId } from 'mongoose'

@Injectable()
export class PriceHistoryService {
    constructor(
        @InjectModel(PriceHistoryModel)
        private readonly priceHistoryModel: ModelType<PriceHistoryModel>,
        @Inject(forwardRef(() => ProductService))
        private readonly productService: ProductService,
        @Inject(forwardRef(() => StoreService))
        private readonly storeService: StoreService,
        @Inject(forwardRef(() => StoreCityService))
        private readonly storeCityService: StoreCityService
    ) {}

    async getPriceHistory(userId: string, storeId: string, productId: string) {
        if (!isValidObjectId(productId)) {
            throw new NotFoundException(PRODUCT_NOT_FOUND_ERROR)
        }

        console.log(`search product | ${new Date()}`)
        const product = await this.productService.getProductById(productId)

        if (!product) {
            throw new NotFoundException(PRODUCT_NOT_FOUND_ERROR)
        }

        console.log(`search history | ${new Date()}`)
        const history = await this.priceHistoryModel
            .find({
                storeId: product.storeId,
                sku: product.sku,
            })
            .sort({
                createdAt: -1,
            })

        console.log(`finished | ${new Date()}`)
        return {
            history,
        }
    }

    async getTop5HighlyCompetitiveProducts(storeId: string) {
        if (!isValidObjectId(storeId)) {
            return []
        }

        const aggregationResult = await this.priceHistoryModel.aggregate([
            {
                $match: {
                    storeId: new Types.ObjectId(storeId),
                },
            },
            {
                $group: {
                    _id: '$sku',
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
            {
                $limit: 10,
            },
        ])

        const result = []

        for (const a of aggregationResult) {
            const product = await this.productService.getProductByQuery({
                sku: a._id,
                storeId,
            })

            if (product) {
                result.push({
                    _id: product._id,
                    count: a.count,
                    name: product.name,
                    url: product.url,
                    price: product.price,
                })
            }
        }

        return result
    }
}
