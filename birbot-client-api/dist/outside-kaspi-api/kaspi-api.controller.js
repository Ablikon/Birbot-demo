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
exports.kaspiAPIController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const kaspi_api_service_1 = require("./kaspi-api.service");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
let kaspiAPIController = class kaspiAPIController {
    constructor(kaspiAPIService) {
        this.kaspiAPIService = kaspiAPIService;
    }
    async createLink(dto, req) {
        const userId = req.user;
        return this.kaspiAPIService.createQrLink(Object.assign(Object.assign({}, dto), { userId }));
    }
    async createToken(dto, req) {
        const userId = req.user;
        return this.kaspiAPIService.createQrToken(Object.assign(Object.assign({}, dto), { userId }));
    }
    async getPaymentStatus(paymentId, req) {
        const userId = req.user;
        return this.kaspiAPIService.getPaymentStatus(paymentId, userId);
    }
    async reufndPurchase(dto, req) {
        const userId = req.user;
        return this.kaspiAPIService.refundPurchase(Object.assign(Object.assign({}, dto), { userId }));
    }
};
__decorate([
    (0, common_1.Post)('/create-link'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], kaspiAPIController.prototype, "createLink", null);
__decorate([
    (0, common_1.Post)('/create-token'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], kaspiAPIController.prototype, "createToken", null);
__decorate([
    (0, common_1.Get)('/status/:paymentId'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('paymentId')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], kaspiAPIController.prototype, "getPaymentStatus", null);
__decorate([
    (0, common_1.Post)('/refund'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], kaspiAPIController.prototype, "reufndPurchase", null);
kaspiAPIController = __decorate([
    (0, common_1.Controller)('kaspi-api'),
    (0, swagger_1.ApiTags)('Kaspi-QR'),
    __metadata("design:paramtypes", [kaspi_api_service_1.KaspiAPIService])
], kaspiAPIController);
exports.kaspiAPIController = kaspiAPIController;
//# sourceMappingURL=kaspi-api.controller.js.map