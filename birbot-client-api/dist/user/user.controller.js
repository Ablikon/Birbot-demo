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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const user_service_1 = require("./user.service");
const user_id_decorator_1 = require("../decorators/user-id.decorator");
const user_referral_service_1 = require("./user-referral/user-referral.service");
const swagger_1 = require("@nestjs/swagger");
const new_feature_dto_1 = require("./dto/new-feature.dto");
const message_dto_1 = require("./dto/message.dto");
const accept_agreement_dto_1 = require("./dto/accept-agreement.dto");
let UserController = class UserController {
    constructor(userService, userReferral) {
        this.userService = userService;
        this.userReferral = userReferral;
    }
    async getProfileInfo(userId) {
        return this.userService.getProfileInfo(userId);
    }
    async getReferralCode(userId) {
        return this.userReferral.getCodeByUserId(userId);
    }
    async getReferrals(userId) {
        return this.userReferral.getUserReferrals(userId);
    }
    async getMoney(dto) {
        return this.userReferral.sendReferralMoneyBackMessage(dto.userId, dto.value);
    }
    async updateProfileInfo(userId, body) {
        return this.userService.updateProfileInfo(userId, body);
    }
    async updateProduct(UserId, dto) {
        return this.userService.updateUserNewFeatures(UserId, dto);
    }
    async isHavePayments(phoneNumber) {
        return this.userService.isHavePayments(phoneNumber);
    }
    async getAgreement(userId) {
        return this.userService.getAgreement(userId);
    }
    async acceptAgreement(userId, dto, req) {
        return this.userService.acceptUserAgreement(userId, dto, req);
    }
};
__decorate([
    (0, common_1.Get)('/'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getProfileInfo", null);
__decorate([
    (0, common_1.Get)('/referral-code'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getReferralCode", null);
__decorate([
    (0, common_1.Get)('/referrals/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getReferrals", null);
__decorate([
    (0, common_1.Post)('/referrals/get-money'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [message_dto_1.Message]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getMoney", null);
__decorate([
    (0, common_1.Patch)('/'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, user_id_decorator_1.UserId)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateProfileInfo", null);
__decorate([
    (0, common_1.Patch)(':userId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Обновить статус новой фичи и онбордига',
    }),
    (0, swagger_1.ApiBody)({
        type: new_feature_dto_1.UpdateUserNewFeatureDto,
        required: true,
    }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, new_feature_dto_1.UpdateUserNewFeatureDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.Get)('/is-have-payments/:phoneNumber'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('phoneNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "isHavePayments", null);
__decorate([
    (0, common_1.Get)('/agreement'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "getAgreement", null);
__decorate([
    (0, common_1.Post)('/agreement/accept'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, user_id_decorator_1.UserId)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, accept_agreement_dto_1.AcceptAgreementDto, Object]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "acceptAgreement", null);
UserController = __decorate([
    (0, common_1.Controller)('profile'),
    __metadata("design:paramtypes", [user_service_1.UserService,
        user_referral_service_1.UserReferralService])
], UserController);
exports.UserController = UserController;
//# sourceMappingURL=user.controller.js.map