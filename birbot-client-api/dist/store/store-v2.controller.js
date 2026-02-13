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
exports.StoreV2Controller = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const user_id_decorator_1 = require("../decorators/user-id.decorator");
const update_store_v2_dto_1 = require("./dto/update-store-v2.dto");
const store_v2_service_1 = require("./store-v2.service");
const class_validator_1 = require("class-validator");
const store_service_1 = require("./store.service");
let StoreV2Controller = class StoreV2Controller {
    constructor(storeV2Service, storeService) {
        this.storeV2Service = storeV2Service;
        this.storeService = storeService;
    }
    async getStorePositionMetrics(startTime, endTime) {
        if (!(0, class_validator_1.isNumberString)(startTime) || !(0, class_validator_1.isNumberString)(endTime)) {
            throw new common_1.BadRequestException();
        }
        return this.storeService.getStorePositionMetrics(new Date(parseInt(startTime)), new Date(parseInt(endTime)));
    }
    async updateOne(dto, storeId, userId) {
        return this.storeV2Service.updateStoreFromController(storeId, userId, dto);
    }
    async checkKaspiToken() {
        return this.storeV2Service.checkKaspiToken();
    }
};
__decorate([
    (0, common_1.Get)('position-metrics'),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StoreV2Controller.prototype, "getStorePositionMetrics", null);
__decorate([
    (0, common_1.Patch)('/:storeId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({
        whitelist: true,
    })),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('storeId')),
    __param(2, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_store_v2_dto_1.UpdateStoreV2Dto, String, String]),
    __metadata("design:returntype", Promise)
], StoreV2Controller.prototype, "updateOne", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/kaspi/auth-check'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StoreV2Controller.prototype, "checkKaspiToken", null);
StoreV2Controller = __decorate([
    (0, common_1.Controller)('/v2/store'),
    (0, swagger_1.ApiTags)('v2 Store'),
    __metadata("design:paramtypes", [store_v2_service_1.StoreV2Service, store_service_1.StoreService])
], StoreV2Controller);
exports.StoreV2Controller = StoreV2Controller;
//# sourceMappingURL=store-v2.controller.js.map