import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { MarketplaceService } from 'src/marketplace/marketplace.service'
import { UpdateStoreV2Dto } from './dto/update-store-v2.dto'
import { StoreModel } from './store.model'
import { isValidObjectId, Types } from 'mongoose'
import { STORE_NOT_FOUND_ERROR } from './store.constants'
import { MARKETPLACE_NOT_FOUND_ERROR } from 'src/marketplace/marketplace.constants'
import { MarketplaceCityModel } from 'src/city/marketplace-city.model'
import { KaspiService } from './kaspi.service'
import { JmartService } from './jmart.service'

@Injectable()
export class StoreV2Service {
    constructor(
      
      
        @InjectModel(StoreModel) private readonly storeModel: ModelType<StoreModel>,
        private readonly marketplaceService: MarketplaceService,
        @InjectModel(MarketplaceCityModel) private readonly marketplaceCityModel: ModelType<MarketplaceCityModel>
    ) {}
    async updateStoreFromController(storeId: string, userId: string, dto: UpdateStoreV2Dto) {
        const storeOwner = await this.getStoreOwner(storeId)
        if (storeOwner !== userId) {
            throw new ForbiddenException()
        }

        const store = await this.findOne(storeId)
        if (!store) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        if (dto.marketplaceId) {
            if (this.marketplaceService.isExists(dto.marketplaceId)) {
                throw new NotFoundException(MARKETPLACE_NOT_FOUND_ERROR)
            }
        }

        if (dto?.mainCity?.id) {
            const foundCity = await this.marketplaceCityModel.findOne({ id: dto.mainCity.id })

            if (!foundCity) {
                throw new BadRequestException('Неправильный id города')
            }

            dto.mainCity.name = foundCity.name
        }

        await this.updateStore(storeId, dto)
    }

    async updateStore(storeId: string, dto: UpdateStoreV2Dto) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        await this.storeModel.updateOne({ _id: storeId }, dto)
    }

    async getStoreOwner(storeId: string): Promise<string> {
        if (!isValidObjectId(storeId)) {
            return ''
        }

        const store = await this.storeModel
            .findOne({
                _id: new Types.ObjectId(storeId),
            })
            .select({
                userId: 1,
            })

        if (store) {
            return store.userId.toString()
        }

        return ''
    }

    async findOne(storeId: string) {
        if (!isValidObjectId(storeId)) {
            return null
        }

        return await this.storeModel.findOne({
            _id: new Types.ObjectId(storeId),
        })
    }

    public async checkKaspiToken() {
        // Stub: kaspiService removed from this minimal version
        return true
    }

   

   

    public async checkRegistration() {}
}
