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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const action_service_1 = require("../action/action.service");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const registration_dto_1 = require("./dto/registration.dto");
const reset_dto_1 = require("./dto/reset.dto");
const setPassword_dto_1 = require("./dto/setPassword.dto");
const verify_dto_1 = require("./dto/verify.dto");
const auth_constants_1 = require("./auth.constants");
let AuthController = class AuthController {
    constructor(authService, actionService) {
        this.authService = authService;
        this.actionService = actionService;
    }
    async registration(dto) {
        return this.authService.registration(dto);
    }
    async login(dto, req) {
        return this.authService.login(dto, req);
    }
    async verify(dto, req) {
        return this.authService.verify(dto, req);
    }
    async reset(dto, req) {
        console.log(`RESET PASSWORD | ${new Date()}`);
        console.log(req);
        if (req.headers['user-agent'].startsWith('SaleScoutApp/1') ||
            req.headers['user-agent'] === 'okhttp/4.9.2') {
            console.log('Mobile app');
        }
        else {
            if (!this.authService.verifyCaptcha(dto.captchaToken)) {
                return new common_1.BadRequestException(auth_constants_1.INVALID_CAPTCHA_ERROR);
            }
        }
        return this.authService.reset(dto);
    }
    async setPassword(dto) {
        return this.authService.setPassword(dto);
    }
};
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, common_1.HttpCode)(201),
    (0, swagger_1.ApiBody)({
        type: registration_dto_1.RegistrationDto,
        required: true,
    }),
    (0, common_1.Post)('/registration'),
    (0, swagger_1.ApiOperation)({
        summary: 'Регистрация',
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [registration_dto_1.RegistrationDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "registration", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('/login'),
    (0, swagger_1.ApiOperation)({
        summary: 'Авторизация',
    }),
    (0, swagger_1.ApiBody)({
        type: login_dto_1.LoginDto,
        required: true,
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('/verify'),
    (0, swagger_1.ApiOperation)({
        summary: 'Верификация номера телефона',
    }),
    (0, swagger_1.ApiBody)({
        type: verify_dto_1.VerifyDto,
        required: true,
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_dto_1.VerifyDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verify", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('/reset'),
    (0, swagger_1.ApiOperation)({
        summary: 'Сбросить пароль',
    }),
    (0, swagger_1.ApiBody)({
        type: reset_dto_1.ResetPasswordDto,
        required: true,
    }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reset_dto_1.ResetPasswordDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "reset", null);
__decorate([
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('/set-password'),
    (0, swagger_1.ApiOperation)({
        summary: 'Установить новый пароль',
    }),
    (0, swagger_1.ApiBody)({
        type: setPassword_dto_1.SetPasswordDto,
        required: true,
    }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [setPassword_dto_1.SetPasswordDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "setPassword", null);
AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    (0, swagger_1.ApiTags)('Authorization'),
    __metadata("design:paramtypes", [auth_service_1.AuthService, action_service_1.ActionService])
], AuthController);
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map