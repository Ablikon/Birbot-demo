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
exports.WarehouseController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const warehouse_service_1 = require("./warehouse.service");
const fs_1 = require("fs");
const create_action_dto_1 = require("../action/dto/create-action.dto");
const action_service_1 = require("../action/action.service");
const user_id_decorator_1 = require("../decorators/user-id.decorator");
const user_service_1 = require("../user/user.service");
const auth_constants_1 = require("../auth/auth.constants");
const class_validator_1 = require("class-validator");
let WarehouseController = class WarehouseController {
    constructor(warehouseService, actionService, userService) {
        this.warehouseService = warehouseService;
        this.actionService = actionService;
        this.userService = userService;
    }
    async uploadKaspiPriceList(file, storeId, userId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'UPLOAD_KASPI_PRICE_LIST';
        newActionDto.storeId = storeId;
        newActionDto.newData = {};
        this.actionService.createNewAction(newActionDto);
        return this.warehouseService.uploadPriceList(file, storeId);
    }
    async getKaspiPriceListHistory(storeId, userId, p, l) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'UPLOAD_KASPI_PRICE_LIST';
        newActionDto.storeId = storeId;
        newActionDto.newData = {};
        this.actionService.createNewAction(newActionDto);
        let page = 1;
        if ((0, class_validator_1.isNumber)(parseInt(p))) {
            page = parseInt(p);
        }
        let limit = 20;
        if ((0, class_validator_1.isNumber)(parseInt(l))) {
            const parsedLimit = parseInt(l);
            if (parsedLimit === 20 || parsedLimit === 50 || parsedLimit === 100) {
                limit = parsedLimit;
            }
        }
        return this.warehouseService.getKaspiPriceListHistory(storeId, page, limit);
    }
    async getKaspiPriceListHistoryById(storeId, historyId, userId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'UPLOAD_KASPI_PRICE_LIST';
        newActionDto.storeId = storeId;
        newActionDto.newData = {};
        this.actionService.createNewAction(newActionDto);
        return this.warehouseService.getKaspiPriceListHistoryById(storeId, historyId);
    }
    async getProductUpdateHistories(storeId, historyId, userId, page, filter, query) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'UPLOAD_KASPI_PRICE_LIST';
        newActionDto.storeId = storeId;
        newActionDto.newData = {};
        this.actionService.createNewAction(newActionDto);
        return this.warehouseService.getProductUpdateHistories(storeId, historyId, parseInt(page), filter, query);
    }
    async generateExample(storeId, dto, userId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'GENERATE_PRICE_LIST_EXAMPLE';
        newActionDto.storeId = storeId;
        newActionDto.newData = {};
        console.log("Creating new actions");
        await this.actionService.createNewAction(newActionDto);
        console.log("Created");
        return this.warehouseService.generateExample(storeId, dto);
    }
    async getLastExample(storeId, userId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'GENERATE_PRICE_LIST_EXAMPLE';
        newActionDto.storeId = storeId;
        newActionDto.newData = {};
        this.actionService.createNewAction(newActionDto);
        return this.warehouseService.getLastPriceListExample(storeId);
    }
    async getExample(res, id) {
        const priceListExample = await this.warehouseService.getPriceListExampleById(id);
        const { path } = priceListExample;
        if (!(0, fs_1.existsSync)(path)) {
            throw new common_1.NotFoundException();
        }
        res.download(path);
    }
};
__decorate([
    (0, common_1.Post)('/kaspi/price-list/:storeId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('price-list')),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Param)('storeId')),
    __param(2, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "uploadKaspiPriceList", null);
__decorate([
    (0, common_1.Get)('/kaspi/price-list/:storeId/history'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "getKaspiPriceListHistory", null);
__decorate([
    (0, common_1.Get)('/kaspi/price-list/:storeId/history/:historyId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Param)('historyId')),
    __param(2, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "getKaspiPriceListHistoryById", null);
__decorate([
    (0, common_1.Get)('/kaspi/price-list/:storeId/history/:historyId/product-update-history'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Param)('historyId')),
    __param(2, (0, user_id_decorator_1.UserId)()),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('filter')),
    __param(5, (0, common_1.Query)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "getProductUpdateHistories", null);
__decorate([
    (0, common_1.Post)('example/:storeId'),
    (0, common_1.HttpCode)(201),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "generateExample", null);
__decorate([
    (0, common_1.Get)('example/last/:storeId'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "getLastExample", null);
__decorate([
    (0, common_1.Get)('example/:id'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WarehouseController.prototype, "getExample", null);
WarehouseController = __decorate([
    (0, common_1.Controller)('warehouse'),
    (0, swagger_1.ApiTags)('Warehouse'),
    __metadata("design:paramtypes", [warehouse_service_1.WarehouseService,
        action_service_1.ActionService,
        user_service_1.UserService])
], WarehouseController);
exports.WarehouseController = WarehouseController;
//# sourceMappingURL=warehouse.controller.js.map