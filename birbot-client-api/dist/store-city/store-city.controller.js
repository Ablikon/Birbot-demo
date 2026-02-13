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
exports.StoreCityController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const create_store_city_dto_1 = require("./dto/create-store-city.dto");
const update_product_city_dto_1 = require("./dto/update-product-city.dto");
const update_store_city_dto_1 = require("./dto/update-store-city.dto");
const store_city_service_1 = require("./store-city.service");
const create_action_dto_1 = require("../action/dto/create-action.dto");
const action_service_1 = require("../action/action.service");
let StoreCityController = class StoreCityController {
    constructor(actionService, storeCityService) {
        this.actionService = actionService;
        this.storeCityService = storeCityService;
    }
    async getProductCities(productId) {
        return this.storeCityService.getProductCities(productId);
    }
    async createStoreCity(dto) {
        return this.storeCityService.createStoreCity(dto);
    }
    async deleteStoreCity(storeCityId) {
        return this.storeCityService.deleteStoreCity(storeCityId);
    }
    async updateProductCity(productCityId, dto) {
        return this.storeCityService.updateProductCity(productCityId, dto);
    }
    async updateProductCities(dto) {
        return this.storeCityService.updateProductCities(dto);
    }
    async updateStoreCityData(dto, storeCityId) {
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = dto.userId;
        newActionDto.action = 'CHANGE_STORE_CITY_DATA';
        newActionDto.storeId = dto.storeId;
        newActionDto.newData = {
            dto,
        };
        this.actionService.createNewAction(newActionDto);
        console.log(storeCityId);
        return this.storeCityService.updateStoreCityData(storeCityId, dto);
    }
    async getStoreCities(storeId) {
        return this.storeCityService.getStoreCities(storeId);
    }
};
__decorate([
    (0, common_1.Get)('/:productId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('productId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreCityController.prototype, "getProductCities", null);
__decorate([
    (0, common_1.Post)('/'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_store_city_dto_1.CreateStoreCityDto]),
    __metadata("design:returntype", Promise)
], StoreCityController.prototype, "createStoreCity", null);
__decorate([
    (0, common_1.Delete)(':storeCityId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeCityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreCityController.prototype, "deleteStoreCity", null);
__decorate([
    (0, common_1.Patch)('/product/:productCityId'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('productCityId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_city_dto_1.UpdateProductCityDto]),
    __metadata("design:returntype", Promise)
], StoreCityController.prototype, "updateProductCity", null);
__decorate([
    (0, common_1.Patch)('/product'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], StoreCityController.prototype, "updateProductCities", null);
__decorate([
    (0, common_1.Post)('/:storeCityId'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('storeCityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_store_city_dto_1.UpdateStoreCityDto, String]),
    __metadata("design:returntype", Promise)
], StoreCityController.prototype, "updateStoreCityData", null);
__decorate([
    (0, common_1.Get)(':storeId/store'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreCityController.prototype, "getStoreCities", null);
StoreCityController = __decorate([
    (0, common_1.Controller)('store-city'),
    (0, swagger_1.ApiTags)('Store City'),
    __metadata("design:paramtypes", [action_service_1.ActionService,
        store_city_service_1.StoreCityService])
], StoreCityController);
exports.StoreCityController = StoreCityController;
//# sourceMappingURL=store-city.controller.js.map