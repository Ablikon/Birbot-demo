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
exports.ProductController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const user_id_decorator_1 = require("../decorators/user-id.decorator");
const product_service_1 = require("./product.service");
const create_action_dto_1 = require("../action/dto/create-action.dto");
const action_service_1 = require("../action/action.service");
const approve_product_dto_1 = require("./dto/approve-product.dto");
const update_product_dto_1 = require("./dto/update-product.dto");
const mass_update_product_1 = require("./dto/mass-update-product");
const user_service_1 = require("../user/user.service");
const auth_constants_1 = require("../auth/auth.constants");
const product_1 = require("./product");
const product_delivery_duration_dto_1 = require("./dto/product-delivery-duration.dto");
let ProductController = class ProductController {
    constructor(productService, product, actionService, userService) {
        this.productService = productService;
        this.product = product;
        this.actionService = actionService;
        this.userService = userService;
    }
    async getProductCountsByStoreId(storeId, userId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'GET_PRODUCT_COUNT';
        newActionDto.storeId = storeId;
        this.actionService.createNewAction(newActionDto);
        return await this.productService.getProductCount(storeId);
    }
    async getProductsByStoreId(limit, page, storeId, q, filter, sortBy, userId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const l = parseInt(limit) || 20;
        const p = parseInt(page) || 1;
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'GET_PRODUCTS_BY_STORE';
        newActionDto.storeId = storeId;
        newActionDto.newData = {
            limit: l,
            page: p,
            query: q,
            filter,
            sortBy,
        };
        this.actionService.createNewAction(newActionDto);
        return this.productService.getProductsByStoreId(storeId, l, p, q, filter, sortBy);
    }
    async getProductsForMobileApp(userId, storeId) {
        return await this.productService.getProductsForMobileApp(userId, storeId);
    }
    async getCancelsMetric(id, userId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        if (!id) {
            throw new Error('id is required');
        }
        return await this.productService.getCancelsMetric(id);
    }
    async getProductById(productId, userId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        return await this.productService.getProductById(productId);
    }
    async updateProduct(productId, dto, userId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'UPDATE_PRODUCT';
        newActionDto.newData = Object.assign({ productId }, dto);
        await this.actionService.createNewAction(newActionDto);
        const result = await this.product.updateProduct(productId, dto);
        return result;
    }
    async approve(storeId, userId, dto) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'SET_ACTIVE_PRODUCT';
        newActionDto.newData = dto;
        newActionDto.storeId = storeId;
        this.actionService.createNewAction(newActionDto);
        return this.productService.approve(storeId, dto);
    }
    async withdrawFromSale(storeId, userId, dto) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'WITHDRAW_FROM_SALE';
        newActionDto.newData = {
            storeId,
            dto,
        };
        this.actionService.createNewAction(newActionDto);
        return this.productService.withdrawFromSale(dto.products, storeId);
    }
    async massUpdateProducts(userId, storeId, dto) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.storeId = storeId;
        newActionDto.action = 'MASS_UPDATE_PRODUCT';
        newActionDto.newData = Object.assign({}, dto);
        this.actionService.createNewAction(newActionDto);
        return this.productService.massUpdateProducts(userId, storeId, dto);
    }
    async getProductDeliveryDurations(storeId, sku) {
        return this.productService.getProductDeliveryDuration(storeId, sku);
    }
    async getProductsRequests(storeId) {
        return this.productService.getProductsRequests(storeId);
    }
    async changeProductDeliveryDuration(storeId, dto) {
        return this.productService.changeProductDeliveryDuration(storeId, dto.sku, dto.deliveryDurations);
    }
    async deleteProductDeliveryDuration(storeId, sku) {
        return this.productService.deleteProductDeliveryDuration(storeId, sku);
    }
    async changeManyProductDeliveryDuration(storeId, dto) {
        return this.productService.changeManyProductDeliveryDuration(storeId, dto.sku, dto.deliveryDurations);
    }
    async getBonusChangeHistory(productId, userId, limit, page) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'GET_BONUS_CHANGE_HISTORY';
        this.actionService.createNewAction(newActionDto);
        return await this.productService.getBonusChangeHistory(productId, limit || 50, page || 1);
    }
    async updateGoldLink(storeId, body, userId) {
        const isBlocked = await this.userService.isBlocked(userId);
        if (isBlocked) {
            throw new common_1.ForbiddenException(auth_constants_1.ACCOUNT_WAS_BLOCKED_ERROR);
        }
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'UPDATE_GOLD_LINK_STATUS';
        newActionDto.storeId = storeId;
        newActionDto.newData = {
            productId: body.productId,
            isLinked: body.isLinked,
        };
        this.actionService.createNewAction(newActionDto);
        return await this.productService.updateGoldLinkStatus(storeId, body.productId, body.isLinked);
    }
};
__decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Get)(':storeId'),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Получить количество товаров по статусам',
    }),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getProductCountsByStoreId", null);
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.Post)(':storeId'),
    (0, swagger_1.ApiQuery)({
        name: 'q',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'filter',
        required: false,
    }),
    (0, swagger_1.ApiQuery)({
        name: 'sort',
        required: false
    }),
    (0, swagger_1.ApiOperation)({
        summary: 'Получить товары по статусам',
    }),
    __param(0, (0, common_1.Query)('limit')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Param)('storeId')),
    __param(3, (0, common_1.Query)('q')),
    __param(4, (0, common_1.Query)('filter')),
    __param(5, (0, common_1.Query)('sortBy')),
    __param(6, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getProductsByStoreId", null);
__decorate([
    (0, common_1.Get)('for-mobile-app/:storeId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, user_id_decorator_1.UserId)()),
    __param(1, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getProductsForMobileApp", null);
__decorate([
    (0, common_1.Get)('/get-cancels-metrics'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({ summary: 'Получить метрику отмен с Kaspi API' }),
    __param(0, (0, common_1.Query)('id')),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getCancelsMetric", null);
__decorate([
    (0, common_1.Get)('product-by-id/:productId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Получить товар по айди',
    }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getProductById", null);
__decorate([
    (0, common_1.Patch)(':productId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Обновить настройку товара',
    }),
    (0, swagger_1.ApiBody)({
        type: update_product_dto_1.UpdateProductDto,
        required: true,
    }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_product_dto_1.UpdateProductDto, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "updateProduct", null);
__decorate([
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('/:storeId/approve'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UsePipes)(),
    (0, swagger_1.ApiOperation)({
        summary: 'Выставить товар на продажу',
    }),
    (0, swagger_1.ApiBody)({
        type: approve_product_dto_1.ApproveProductDto,
        required: true,
    }),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, approve_product_dto_1.ApproveProductDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':storeId/withdraw'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Снять товар с продажи',
    }),
    (0, swagger_1.ApiBody)({
        type: approve_product_dto_1.ApproveProductDto,
        required: true,
    }),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, approve_product_dto_1.ApproveProductDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "withdrawFromSale", null);
__decorate([
    (0, common_1.Patch)(':storeId/mass'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Массовые действия',
    }),
    (0, swagger_1.ApiBody)({
        type: mass_update_product_1.MassUpdateProductsDto,
        required: true,
    }),
    __param(0, (0, user_id_decorator_1.UserId)()),
    __param(1, (0, common_1.Param)('storeId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, mass_update_product_1.MassUpdateProductsDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "massUpdateProducts", null);
__decorate([
    (0, common_1.Get)(':storeId/delivery-duration'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Получить способы демпинга цен',
    }),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Query)('sku')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getProductDeliveryDurations", null);
__decorate([
    (0, common_1.Get)(':storeId/products-requests'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Получить количество запросов на изменение цены по товарам',
    }),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getProductsRequests", null);
__decorate([
    (0, common_1.Post)(':storeId/delivery-duration'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Обновить способы демпинга цен',
    }),
    (0, swagger_1.ApiBody)({
        type: product_delivery_duration_dto_1.ProductDeliveryDurationDto,
        required: true,
    }),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_delivery_duration_dto_1.ProductDeliveryDurationDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "changeProductDeliveryDuration", null);
__decorate([
    (0, common_1.Delete)(':storeId/delivery-duration'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Удалить способы демпинга цен',
    }),
    (0, swagger_1.ApiBody)({
        type: product_delivery_duration_dto_1.ProductDeliveryDurationDto,
        required: true,
    }),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Query)('sku')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "deleteProductDeliveryDuration", null);
__decorate([
    (0, common_1.Post)(':storeId/delivery-duration/many'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiOperation)({
        summary: 'Обновить способы демпинга цен',
    }),
    (0, swagger_1.ApiBody)({
        type: product_delivery_duration_dto_1.ProductDeliveryDurationManyDto,
        required: true,
    }),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, product_delivery_duration_dto_1.ProductDeliveryDurationManyDto]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "changeManyProductDeliveryDuration", null);
__decorate([
    (0, common_1.Get)('bonus-history/:productId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Получить историю изменений бонусов для продукта',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Количество записей на странице (по умолчанию 50)',
    }),
    (0, swagger_1.ApiQuery)({
        name: 'page',
        required: false,
        type: Number,
        description: 'Номер страницы (по умолчанию 1)',
    }),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('page')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "getBonusChangeHistory", null);
__decorate([
    (0, common_1.Patch)(':storeId/gold-link'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    (0, swagger_1.ApiOperation)({
        summary: 'Обновить статус привязки товара к золоту',
    }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                productId: { type: 'string' },
                isLinked: { type: 'boolean' },
            },
            required: ['productId', 'isLinked'],
        },
    }),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], ProductController.prototype, "updateGoldLink", null);
ProductController = __decorate([
    (0, common_1.Controller)('product'),
    (0, swagger_1.ApiTags)('Product'),
    __metadata("design:paramtypes", [product_service_1.ProductService,
        product_1.Product,
        action_service_1.ActionService,
        user_service_1.UserService])
], ProductController);
exports.ProductController = ProductController;
//# sourceMappingURL=product.controller.js.map