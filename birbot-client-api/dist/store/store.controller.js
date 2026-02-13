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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const action_service_1 = require("../action/action.service");
const create_action_dto_1 = require("../action/dto/create-action.dto");
const auth_constants_1 = require("../auth/auth.constants");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const user_id_decorator_1 = require("../decorators/user-id.decorator");
const user_service_1 = require("../user/user.service");
const create_store_phone_dto_1 = require("./dto/create-store-phone.dto");
const create_store_dto_1 = require("./dto/create-store.dto");
const set_start_or_stop_dto_1 = require("./dto/set-start-or-stop.dto");
const start_stop_store_dto_1 = require("./dto/start-stop-store.dto");
const update_api_token_dto_1 = require("./dto/update-api-token.dto");
const update_demping_city_id_dto_1 = require("./dto/update-demping-city-id.dto");
const update_store_credentials_dto_1 = require("./dto/update-store-credentials.dto");
const update_store_phone_dto_1 = require("./dto/update-store-phone.dto");
const verify_store_phone_dto_1 = require("./dto/verify-store-phone.dto");
const store_v2_service_1 = require("./store-v2.service");
const store_constants_1 = require("./store.constants");
const store_service_1 = require("./store.service");
const reAuthStoreByPhone_dto_1 = require("./dto/reAuthStoreByPhone.dto");
const update_store_slug_dto_1 = require("./dto/update-store-slug.dto");
const set_is_demping_on_loan_period_1 = require("./dto/set-is-demping-on-loan-period");
const update_store_tax_regime_dto_1 = require("./dto/update-store-tax-regime.dto");
let StoreController = class StoreController {
    constructor(storeService, storeV2Service, actionService, userService) {
        this.storeService = storeService;
        this.storeV2Service = storeV2Service;
        this.actionService = actionService;
        this.userService = userService;
    }
    async setIsDempingOnLoan(storeId, dto) {
        console.log(storeId, dto);
        return this.storeService.setIsDempingOnLoanPeriod(storeId, dto);
    }
    async showNYDiscount(userId) {
        return this.storeService.showNYDiscount(userId);
    }
    async setStartOrStop(storeId, dto) {
        return this.storeService.setStartOrStop(storeId, dto);
    }
    async getStores(id, userId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'GET_STORE_LIST';
        this.actionService.createNewAction(newActionDto);
        return this.storeService.getStoresByUserIdForClient(id);
    }
    async getStore(storeId, userId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.storeId = storeId;
        newActionDto.action = 'GET_STORE';
        this.actionService.createNewAction(newActionDto);
        const owner = await this.storeV2Service.getStoreOwner(storeId);
        if (owner !== userId) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const response = await this.storeService.getStoreByIdForClient(storeId);
        const { orderStatusExpireDate } = response, rest = __rest(response, ["orderStatusExpireDate"]);
        return rest;
    }
    async getStorePickupPoints(userId, storeId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.storeId = storeId;
        newActionDto.action = 'GET_STORE_WAREHOUSE';
        this.actionService.createNewAction(newActionDto);
        return this.storeService.getStorePickupPoints(storeId);
    }
    async getStoreStatistics(storeId, filter, userId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'GET_STORE_STATISTICS';
        newActionDto.storeId = storeId;
        newActionDto.newData = {
            filter,
        };
        this.actionService.createNewAction(newActionDto);
        const owner = await this.storeV2Service.getStoreOwner(storeId);
        if (owner !== userId) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        return this.storeService.getStoreCabinetStatistics(storeId, filter);
    }
    async createTestStore(id) {
        return await this.storeService.createTestStore(id);
    }
    async createStore(dto, id) {
        const isBlocked = await this.userService.isBlocked(id);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = id;
        newActionDto.action = 'CREATE_STORE';
        newActionDto.newData = {
            dto,
        };
        this.actionService.createNewAction(newActionDto);
        return await this.storeService.createStore(dto, id);
    }
    async createStoreByPhone(dto, userId, res) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'SEND_PIN_CODE';
        newActionDto.newData = {
            dto,
        };
        this.actionService.createNewAction(newActionDto);
        return this.storeService.createStorePhone(dto, userId);
    }
    async sendStoreCode(storeId, userId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'SEND_STORE_PIN_CODE';
        this.actionService.createNewAction(newActionDto);
        return this.storeService.sendStorePinCode(storeId);
    }
    async verifyPhoneNumber(dto, userId) {
        console.error('[^]' + ' store.controller verifyPhoneNumber START' + ' | ' + new Date() + ' | ' + `userId: ${userId}, token: ${dto.token ? 'есть' : 'нет'}, pin: ${dto.pin ? 'есть' : 'нет'}`);
        console.log('[^]' + ' store.controller verifyPhoneNumber START' + ' | ' + new Date() + ' | ' + `userId: ${userId}, token: ${dto.token ? 'есть' : 'нет'}, pin: ${dto.pin ? 'есть' : 'нет'}`);
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            console.error('[^]' + ' store.controller verifyPhoneNumber BLOCKED' + ' | ' + new Date() + ' | ' + `userId: ${userId}`);
            console.log('[^]' + ' store.controller verifyPhoneNumber BLOCKED' + ' | ' + new Date() + ' | ' + `userId: ${userId}`);
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'VERIFY_CODE';
        newActionDto.newData = {
            dto,
        };
        this.actionService.createNewAction(newActionDto);
        console.error('[^]' + ' store.controller verifyPhoneNumber CALLING SERVICE' + ' | ' + new Date() + ' | ' + `userId: ${userId}`);
        console.log('[^]' + ' store.controller verifyPhoneNumber CALLING SERVICE' + ' | ' + new Date() + ' | ' + `userId: ${userId}`);
        let result;
        try {
            result = await this.storeService.verifyPhoneNumber(dto, userId);
        }
        catch (error) {
            console.error('[^]' + ' store.controller verifyPhoneNumber SERVICE_ERROR' + ' | ' + new Date() + ' | ' +
                `userId: ${userId}, error: ${(error === null || error === void 0 ? void 0 : error.message) || 'unknown'}, statusCode: ${(error === null || error === void 0 ? void 0 : error.status) || 'нет'}`);
            throw error;
        }
        console.error('[^]' + ' store.controller verifyPhoneNumber SUCCESS' + ' | ' + new Date() + ' | ' + `userId: ${userId}, storeId: ${result._id}`);
        console.log('[^]' + ' store.controller verifyPhoneNumber SUCCESS' + ' | ' + new Date() + ' | ' + `userId: ${userId}, storeId: ${result._id}`);
        return result;
    }
    async reAuthStoreByPhone(dto, userId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'SEND_PIN_CODE';
        newActionDto.newData = {
            dto,
        };
        this.actionService.createNewAction(newActionDto);
        return this.storeService.reAuthStoreByPhone(dto);
    }
    async reVerifyPhoneNumber(dto, userId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'VERIFY_CODE';
        newActionDto.newData = {
            dto,
        };
        this.actionService.createNewAction(newActionDto);
        return this.storeService.reVerifyPhoneNumber(dto);
    }
    async updateStartOrStop(storeId, userId, dto) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'STORE_START_STOP';
        newActionDto.storeId = storeId;
        newActionDto.newData = {
            dto,
        };
        this.actionService.createNewAction(newActionDto);
        const owner = await this.storeV2Service.getStoreOwner(storeId);
        if (owner !== userId) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        return this.storeService.updateStartOrStop(dto, storeId, userId);
    }
    async updateKaspiCredentials(storeId, userId, dto) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'SET_KASPI_CREDENTIALS';
        newActionDto.storeId = storeId;
        newActionDto.newData = {
            dto,
        };
        this.actionService.createNewAction(newActionDto);
        const owner = await this.storeV2Service.getStoreOwner(storeId);
        if (owner !== userId) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        return await this.storeService.updateKaspiCredentials(userId, storeId, dto);
    }
    async updateMainCity(storeId, dto) {
        const isBlocked = await this.userService.isBlocked(dto.userId.toString());
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const owner = await this.storeV2Service.getStoreOwner(storeId);
        if (owner !== dto.userId.toString()) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = dto.userId;
        newActionDto.action = 'CHANGE_MAIN_CITY';
        newActionDto.storeId = storeId;
        newActionDto.newData = {
            dto,
        };
        this.actionService.createNewAction(newActionDto);
        return this.storeService.updateMainCity(dto.userId.toString(), storeId, dto);
    }
    async updateMainCityData(storeId, dto) {
        const isBlocked = await this.userService.isBlocked(dto.userId.toString());
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const owner = await this.storeV2Service.getStoreOwner(storeId);
        if (owner !== dto.userId.toString()) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = dto.userId;
        newActionDto.action = 'UPDATE_MAIN_CITY_DATA';
        newActionDto.storeId = storeId;
        newActionDto.newData = {
            dto,
        };
        this.actionService.createNewAction(newActionDto);
        return this.storeService.updateMainCityData(dto.userId.toString(), storeId, dto);
    }
    async updateApiToken(storeId, dto, userId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'SET_STORE_TOKEN';
        newActionDto.storeId = storeId;
        newActionDto.newData = {
            dto,
        };
        this.actionService.createNewAction(newActionDto);
        const owner = await this.storeV2Service.getStoreOwner(storeId);
        if (owner !== userId) {
            throw new common_1.NotFoundException(store_constants_1.STORE_NOT_FOUND_ERROR);
        }
        return this.storeService.updateApiToken(storeId, dto);
    }
    async updatePhoneNumber(dto, storeId, userId) {
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'UPDATE_PHONE_NUMBER';
        newActionDto.storeId = storeId;
        newActionDto.newData = {
            dto,
        };
        this.actionService.createNewAction(newActionDto);
        return this.storeService.updateStorePhoneNumber(userId, storeId, dto);
    }
    async loadFromKaspi(userId, storeId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'LOAD_PRODUCTS_FROM_KASPI';
        newActionDto.storeId = storeId;
        this.actionService.createNewAction(newActionDto);
        return this.storeService.loadProductsFromKaspi(userId, storeId);
    }
    async getLoadProductsLastMessage(storeId) {
        return this.storeService.getLoadProductsLastMessage(storeId);
    }
    async deleteLoadProductsLastMessage(storeId) {
        return this.storeService.deleteLoadProductsLastMessage(storeId);
    }
    async isAuthorized(storeId, userId) {
        return this.storeService.isAuthorized(userId, storeId);
    }
    async getGeneralStats(filter, storeId, startDate, endDate) {
        return this.storeService.getGeneralStats(storeId, filter, startDate, endDate);
    }
    async getProfit(filter, storeId, startDate, endDate) {
        return this.storeService.getProfit(storeId, filter, startDate, endDate);
    }
    async getTopProducts(filter, storeId) {
        return this.storeService.getTopProducts(storeId, filter);
    }
    async getTopMarginProducts(storeId) {
        return this.storeService.getTopMarginProducts(storeId);
    }
    async getTopLowMarginProducts(storeId) {
        return this.storeService.getTopLowMarginProducts(storeId);
    }
    async getChart(storeId, filter, startDate, endDate) {
        return this.storeService.getChart(storeId, filter, startDate, endDate);
    }
    async getPriceListExcel(storeId, filter, res) {
        return this.storeService.getDashboardExcel(storeId, filter, res);
    }
    async updateStpreSlug(dto, storeId) {
        return this.storeService.updateStoreSlug(storeId, dto);
    }
    async updateStoreTaxRegime(dto, storeId) {
        return this.storeService.updateStoreTaxRegime(storeId, dto.taxRegime);
    }
    async getStoreSlug(storeId) {
        return this.storeService.getStoreUploadLimit(storeId);
    }
    async getNextXmlTime(storeId) {
        return this.storeService.getTimeWhenNextXmlUpload(storeId);
    }
    async loadOrdersFromKaspi(userId, storeId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'LOAD_ORDERS_FROM_KASPI';
        newActionDto.storeId = storeId;
        this.actionService.createNewAction(newActionDto);
        return this.storeService.loadOrdersFromKaspi(userId, storeId);
    }
    async getLoadOrdersLastMessage(storeId) {
        return this.storeService.getLoadOrdersLastMessage(storeId);
    }
    async deleteLoadOrdersLastMessage(storeId) {
        return this.storeService.deleteLoadOrdersLastMessage(storeId);
    }
};
__decorate([
    (0, common_1.Post)('/:storeId/demping-on-loan-period'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, set_is_demping_on_loan_period_1.SetIsDempingOnLoanPeriod]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "setIsDempingOnLoan", null);
__decorate([
    (0, common_1.Get)('/show-ny-discount'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "showNYDiscount", null);
__decorate([
    (0, common_1.Post)('/:storeId/launch-stop'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, set_start_or_stop_dto_1.SetStartOrStopDto]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "setStartOrStop", null);
__decorate([
    (0, common_1.Get)('/'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, user_id_decorator_1.UserId)()),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getStores", null);
__decorate([
    (0, common_1.Get)('/:storeId'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getStore", null);
__decorate([
    (0, common_1.Get)('/:storeId/warehouse'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, user_id_decorator_1.UserId)()),
    __param(1, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getStorePickupPoints", null);
__decorate([
    (0, common_1.Get)('/statistics/:storeId'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Query)('filter')),
    __param(2, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getStoreStatistics", null);
__decorate([
    (0, common_1.Post)('/test'),
    (0, common_1.HttpCode)(201),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Создать тестовый магазин с демо-товарами' }),
    __param(0, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "createTestStore", null);
__decorate([
    (0, common_1.Post)('/'),
    (0, common_1.HttpCode)(201),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_store_dto_1.CreateStoreDto, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "createStore", null);
__decorate([
    (0, common_1.Post)('/phone'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_store_phone_dto_1.CreateStorePhoneDto, String, Object]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "createStoreByPhone", null);
__decorate([
    (0, common_1.Post)('/phone/send/:storeId'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "sendStoreCode", null);
__decorate([
    (0, common_1.Post)('/phone/verify'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_store_phone_dto_1.VerifyNewStorePhoneDto, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "verifyPhoneNumber", null);
__decorate([
    (0, common_1.Post)('/phone-re-auth'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [reAuthStoreByPhone_dto_1.ReAuthStoreByPhone, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "reAuthStoreByPhone", null);
__decorate([
    (0, common_1.Post)('/phone/re-verify'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_store_phone_dto_1.VerifyExistingStorePhoneDto, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "reVerifyPhoneNumber", null);
__decorate([
    (0, common_1.Post)('/start-stop/:storeId'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, start_stop_store_dto_1.StartStopStoreDto]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "updateStartOrStop", null);
__decorate([
    (0, common_1.Patch)('/credentials/:storeId'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, update_store_credentials_dto_1.UpdateStoreCredentialsDto]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "updateKaspiCredentials", null);
__decorate([
    (0, common_1.Post)('update-main-city/:storeId'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_demping_city_id_dto_1.UpdateDempingCityIdDto]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "updateMainCity", null);
__decorate([
    (0, common_1.Patch)('update-main-city-data/:storeId'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_demping_city_id_dto_1.UpdateDempingCityIdDto]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "updateMainCityData", null);
__decorate([
    (0, common_1.Patch)('/token/:storeId'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, common_1.HttpCode)(204),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_api_token_dto_1.UpdateApiTokenDto, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "updateApiToken", null);
__decorate([
    (0, common_1.Patch)(':storeId/phone'),
    (0, common_1.UsePipes)(new common_1.ValidationPipe()),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('storeId')),
    __param(2, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_store_phone_dto_1.UpdateStorePhoneDto, String, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "updatePhoneNumber", null);
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':storeId/load-products'),
    (0, swagger_1.ApiOperation)({
        summary: 'Загрузить все товары с маркетплейса',
    }),
    __param(0, (0, user_id_decorator_1.UserId)()),
    __param(1, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "loadFromKaspi", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':storeId/load-products'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получить все действие системы',
    }),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getLoadProductsLastMessage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':storeId/load-products'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получить все действие системы',
    }),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "deleteLoadProductsLastMessage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/is-auth/:storeId'),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "isAuthorized", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/:storeId/stats/general'),
    __param(0, (0, common_1.Query)('filter')),
    __param(1, (0, common_1.Param)('storeId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getGeneralStats", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/:storeId/stats/profit'),
    __param(0, (0, common_1.Query)('filter')),
    __param(1, (0, common_1.Param)('storeId')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getProfit", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/:storeId/stats/top-products'),
    __param(0, (0, common_1.Query)('filter')),
    __param(1, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getTopProducts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/:storeId/stats/top-margin-products'),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getTopMarginProducts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/:storeId/stats/top-low-margin-products'),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getTopLowMarginProducts", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/:storeId/stats/chart'),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Query)('filter')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Date,
        Date]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getChart", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/:storeId/stats/excel'),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Query)('filter')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getPriceListExcel", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Patch)('/:storeId/slug'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_store_slug_dto_1.UpdateStoreSlugDto, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "updateStpreSlug", null);
__decorate([
    (0, common_1.Patch)(':storeId/taxRegime'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [update_store_tax_regime_dto_1.UpdateStoreTaxRegimeDto, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "updateStoreTaxRegime", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/:storeId/limit'),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getStoreSlug", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)('/:storeId/next-xml-time'),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getNextXmlTime", null);
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':storeId/load-orders'),
    (0, swagger_1.ApiOperation)({
        summary: "Загрузить все заказы с маркетплейса"
    }),
    __param(0, (0, user_id_decorator_1.UserId)()),
    __param(1, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "loadOrdersFromKaspi", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':storeId/load-orders'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получить все действие системы',
    }),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "getLoadOrdersLastMessage", null);
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Delete)(':storeId/load-orders'),
    (0, swagger_1.ApiOperation)({
        summary: 'Получить все действие системы',
    }),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], StoreController.prototype, "deleteLoadOrdersLastMessage", null);
StoreController = __decorate([
    (0, common_1.Controller)('store'),
    (0, swagger_1.ApiTags)('Store'),
    __metadata("design:paramtypes", [store_service_1.StoreService,
        store_v2_service_1.StoreV2Service,
        action_service_1.ActionService,
        user_service_1.UserService])
], StoreController);
exports.StoreController = StoreController;
//# sourceMappingURL=store.controller.js.map