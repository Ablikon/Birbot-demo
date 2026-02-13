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
exports.PriceHistoryController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const user_id_decorator_1 = require("../decorators/user-id.decorator");
const price_history_service_1 = require("./price-history.service");
let PriceHistoryController = class PriceHistoryController {
    constructor(priceHistroyService) {
        this.priceHistroyService = priceHistroyService;
    }
    async getPriceHistory(storeId, productId, userId) {
        return this.priceHistroyService.getPriceHistory(userId, storeId, productId);
    }
};
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/:storeId/:productId'),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Param)('productId')),
    __param(2, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], PriceHistoryController.prototype, "getPriceHistory", null);
PriceHistoryController = __decorate([
    (0, common_1.Controller)('price-history'),
    (0, swagger_1.ApiTags)('Price History'),
    __metadata("design:paramtypes", [price_history_service_1.PriceHistoryService])
], PriceHistoryController);
exports.PriceHistoryController = PriceHistoryController;
//# sourceMappingURL=price-history.controller.js.map