"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreV2Service = void 0;
const common_1 = require("@nestjs/common");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const marketplace_service_1 = require("../marketplace/marketplace.service");
const store_model_1 = require("./store.model");
const mongoose_1 = require("mongoose");
const store_constants_1 = require("./store.constants");
const marketplace_constants_1 = require("../marketplace/marketplace.constants");
const marketplace_city_model_1 = require("../city/marketplace-city.model");
let StoreV2Service = class StoreV2Service {
    constructor(storeModel, marketplaceService, marketplaceCityModel) {
        this.storeModel = storeModel;
        this.marketplaceService = marketplaceService;
        this.marketplaceCityModel = marketplaceCityModel;
    }
    async updateStoreFromController(storeId, userId, dto) {
        var _a;
        const storeOwner = await this.getStoreOwner(storeId);
        if (storeOwner !== userId) {
            throw new common_1.ForbiddenException();
        }
        const store = await this.findOne(storeId);
        if (!store) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        if (dto.marketplaceId) {
            if (this.marketplaceService.isExists(dto.marketplaceId)) {
                throw new common_1.NotFoundException(marketplace_constants_1.MARKETPLACE_NOT_FOUND_ERROR);
            }
        }
        if ((_a = dto === null || dto === void 0 ? void 0 : dto.mainCity) === null || _a === void 0 ? void 0 : _a.id) {
            const foundCity = await this.marketplaceCityModel.findOne({ id: dto.mainCity.id });
            if (!foundCity) {
                throw new common_1.BadRequestException('Неправильный id города');
            }
            dto.mainCity.name = foundCity.name;
        }
        await this.updateStore(storeId, dto);
    }
    async updateStore(storeId, dto) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        await this.storeModel.updateOne({ _id: storeId }, dto);
    }
    async getStoreOwner(storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            return '';
        }
        const store = await this.storeModel
            .findOne({
            _id: new mongoose_1.Types.ObjectId(storeId),
        })
            .select({
            userId: 1,
        });
        if (store) {
            return store.userId.toString();
        }
        return '';
    }
    async findOne(storeId) {
        if (!(0, mongoose_1.isValidObjectId)(storeId)) {
            return null;
        }
        return await this.storeModel.findOne({
            _id: new mongoose_1.Types.ObjectId(storeId),
        });
    }
    async checkKaspiToken() {
        return true;
    }
    async checkRegistration() { }
};
StoreV2Service = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_typegoose_1.InjectModel)(store_model_1.StoreModel)),
    __param(2, (0, nestjs_typegoose_1.InjectModel)(marketplace_city_model_1.MarketplaceCityModel)),
    __metadata("design:paramtypes", [Object, marketplace_service_1.MarketplaceService, Object])
], StoreV2Service);
exports.StoreV2Service = StoreV2Service;
//# sourceMappingURL=store-v2.service.js.map