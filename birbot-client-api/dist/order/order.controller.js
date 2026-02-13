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
exports.OrderController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const action_service_1 = require("../action/action.service");
const create_action_dto_1 = require("../action/dto/create-action.dto");
const jwt_guard_1 = require("../auth/guards/jwt.guard");
const user_id_decorator_1 = require("../decorators/user-id.decorator");
const order_service_1 = require("./order.service");
const platform_express_1 = require("@nestjs/platform-express");
const app_root_path_1 = require("app-root-path");
const fs_extra_1 = require("fs-extra");
const fs_1 = require("fs");
const class_validator_1 = require("class-validator");
const update_order_dto_1 = require("./dto/update-order.dto");
const verify_order_recieving_dto_1 = require("../store/dto/verify-order-recieving.dto");
let OrderController = class OrderController {
    constructor(orderService, actionService) {
        this.orderService = orderService;
        this.actionService = actionService;
    }
    async getStatisticsLast24Hours() {
        return this.orderService.getOrdersStattisticsLast24Hours();
    }
    async getStatisticsLastMonth() {
        return this.orderService.getOrdersStattisticsLastMonth();
    }
    async getStatusesReport(storeId) {
        return this.orderService.getStatusesReport(storeId);
    }
    async getFirstOrderDate(storeId) {
        const date = await this.orderService.getFirstOrderDate(storeId);
        return { firstOrderDate: date };
    }
    async stats() {
        const result = await this.orderService.getOrderStatisctics(0, 'site');
        return {
            count: result.today,
            sum: result.todayTotalSum,
        };
    }
    async getOrderByCode(orderCode, req) {
        const token = (req.headers.authorization || '').replace('Bearer ', '');
        return this.orderService.getOrderByCode(token, orderCode);
    }
    async getOrdersList(page = 1, limit = 10, startDate, endDate, req) {
        const token = (req.headers.authorization || '').replace('Bearer ', '');
        return this.orderService.getOrdersList(token, {
            page,
            limit,
            startDate,
            endDate,
        });
    }
    async getStorePickupCities(storeId) {
        return this.orderService.getStorePickupCities(storeId);
    }
    async getStoreOrdersCount(storeId) {
        return this.orderService.getStoreOrdersCount(storeId);
    }
    async getOrderStatsByStoreId(storeId, filter, startDate, endDate, userId) {
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'GET_ORDERS_BY_STORE_ID';
        newActionDto.storeId = storeId;
        newActionDto.newData = {
            filter,
        };
        this.actionService.createNewAction(newActionDto);
        return this.orderService.getOrderStatsByStoreId(storeId, filter, startDate, endDate);
    }
    async saveOrderEntries(orderCode, storeId, orderEntries) {
        return this.orderService.saveOrderEntries(storeId, orderCode, orderEntries);
    }
    async getOrderEntryImage(fileName, res) {
        const image = await this.orderService.getOrderEntryImage(fileName);
        if (!image) {
            throw new common_1.NotFoundException();
        }
        const fullFolderPath = `${app_root_path_1.path}/uploads/order-entry-image`;
        const fullFilePath = `${fullFolderPath}/${image.fileName}`;
        await (0, fs_extra_1.ensureDir)(fullFolderPath);
        (0, fs_1.writeFileSync)(fullFilePath, image.imageBuffer);
        await this.sleep(200);
        res.sendFile(fullFilePath);
        await this.sleep(5000);
        try {
            (0, fs_1.unlinkSync)(fullFilePath);
        }
        catch (e) {
            console.log('[^]' + ' order.controller ' + ' | ' + new Date() + ' | ' + '\n' + e);
        }
    }
    async getOrderImage(fileName, res) {
        const image = await this.orderService.getOrderImage(fileName);
        if (!image) {
            throw new common_1.NotFoundException();
        }
        const fullFolderPath = `${app_root_path_1.path}/uploads/order-image`;
        const fullFilePath = `${fullFolderPath}/${image.fileName}`;
        await (0, fs_extra_1.ensureDir)(fullFolderPath);
        (0, fs_1.writeFileSync)(fullFilePath, image.imageBuffer);
        await this.sleep(200);
        res.sendFile(fullFilePath);
        await this.sleep(5000);
        try {
            (0, fs_1.unlinkSync)(fullFilePath);
        }
        catch (e) {
            console.log('[^]' + ' order.controller ' + ' | ' + new Date() + ' | ' + '\n' + e);
        }
    }
    async deleteOrderEntryImage(orderEntryImageId) {
        return this.orderService.deleteOrderEntryImage(orderEntryImageId);
    }
    async deleteOrderImage(orderEntryImageId) {
        return this.orderService.deleteOrderImage(orderEntryImageId);
    }
    async saveOrderEntryImage(file, orderCode, storeId, productCode) {
        return this.orderService.saveOrderEntryImage(storeId, orderCode, productCode, file);
    }
    async saveOrderImage(file, orderCode, storeId) {
        return this.orderService.saveOrderImage(storeId, orderCode, file);
    }
    async getOrderEntries(orderCode) {
        return this.orderService.getOrderEntries(orderCode);
    }
    async getStoreOrders(storeId, state, q, page, limit, town, dateFrom, dateTo) {
        return this.orderService.getStoreOrders({
            state,
            storeId,
            page: (0, class_validator_1.isNumberString)(page) ? parseInt(page) : 1,
            limit: (0, class_validator_1.isNumberString)(limit) ? parseInt(limit) : 20,
            query: q,
            town: town ? town : null,
            dateFrom: dateFrom,
            dateTo: dateTo,
        });
    }
    async acceptAllOrders(storeId, town) {
        return this.orderService.acceptAllOrders(storeId, town ? town : null);
    }
    async acceptOrder(storeId, orderId, orderCode, accept, cancelReason) {
        try {
            const response = await this.orderService.acceptOrDeclineOrder(accept, orderId, orderCode, storeId, null, null, cancelReason);
            return response;
        }
        catch (error) {
            if (error.response) {
                const { status, data } = error.response;
                throw new common_1.HttpException(data, status);
            }
            else {
                throw new common_1.HttpException('Internal Server Error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    async orderIssuing(storeId, orderId, securityCode, sendCode) {
        try {
            const response = await this.orderService.orderIssuing(sendCode, orderId, securityCode, storeId, null);
            return response;
        }
        catch (error) {
            if (error.response) {
                const { status, data } = error.response;
                throw new common_1.HttpException(data, status);
            }
            else {
                throw new common_1.HttpException('Internal Server Error', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    async generateInvoices(storeId, dto) {
        return this.orderService.generateInvoices(storeId, dto);
    }
    async getInvoices(storeId, printerType, dto, res) {
        return this.orderService.getInvoices(storeId, printerType, dto, res);
    }
    async getProductOrders(productId, userId) {
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'GET_ORDERS_BY_PRODUCT_ID';
        newActionDto.newData = {
            productId,
        };
        this.actionService.createNewAction(newActionDto);
        return this.orderService.getProductOrders(productId);
    }
    async getProductOrdersHistory(storeId, productId, filterFromDate, filterToDate) {
        return this.orderService.getOrdersHistoryByProductSku(storeId, productId, filterFromDate, filterToDate);
    }
    async sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
    async updateOrder(orderCode, dto, userId) {
        return this.orderService.updateOrder(userId, orderCode, dto);
    }
    async getExcel(storeId, state, cityId, filterFromDate, filterToDate, res) {
        return await this.orderService.getExcel(res, storeId, filterFromDate, filterToDate, cityId, state);
    }
    async getStoreRefunds(storeId, state, query, page, limit, town) {
        return this.orderService.getStoreRefunds({
            state,
            storeId,
            page: (0, class_validator_1.isNumberString)(page) ? parseInt(page) : 1,
            limit: (0, class_validator_1.isNumberString)(limit) ? parseInt(limit) : 20,
            query,
            town: town ? town : null,
        });
    }
    async getStoreRefundsCount(storeId) {
        console.log('test');
        return this.orderService.getStoreRefundsCount(storeId);
    }
    async getRefundEntries(applicationNumber) {
        return this.orderService.getOrderEntries(applicationNumber);
    }
    async sendStoreCode(storeId, orderId, userId) {
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'SEND_ORDER_PIN_CODE';
        this.actionService.createNewAction(newActionDto);
        return this.orderService.sendOrderPinCode(storeId, orderId);
    }
    async verifyPhoneNumber(dto, userId) {
        const newActionDto = new create_action_dto_1.CreateActionDto();
        newActionDto.userId = userId;
        newActionDto.action = 'VERIFY_ORDER_CODE';
        newActionDto.newData = {
            dto,
        };
        this.actionService.createNewAction(newActionDto);
        return this.orderService.verifyPhoneNumber(dto);
    }
    async completeOrder(orderId) {
        console.log('Order complete');
        return this.orderService.completeOrder(orderId);
    }
    async getSSOrdersCount(storeId) {
        return this.orderService.getOrdersCount(storeId);
    }
    async getStoreSSOrders(storeId, state, page, limit, town, dateFrom, dateTo) {
        return this.orderService.getStoreSSOrders({
            state,
            storeId,
            page: (0, class_validator_1.isNumberString)(page) ? parseInt(page) : 1,
            limit: (0, class_validator_1.isNumberString)(limit) ? parseInt(limit) : 20,
            town: town ? town : null,
            dateFrom: dateFrom,
            dateTo: dateTo,
        });
    }
};
__decorate([
    (0, common_1.Get)('stats-last-24-hours'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getStatisticsLast24Hours", null);
__decorate([
    (0, common_1.Get)('stats-last-month'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getStatisticsLastMonth", null);
__decorate([
    (0, common_1.Get)(':storeId/statuses-report'),
    (0, common_1.UseGuards)(new jwt_guard_1.JwtAuthGuard()),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getStatusesReport", null);
__decorate([
    (0, common_1.Get)('/:storeId/first-order-date'),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getFirstOrderDate", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('/:orderCode/details'),
    __param(0, (0, common_1.Param)('orderCode')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderByCode", null);
__decorate([
    (0, common_1.Get)('orderlist'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __param(4, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrdersList", null);
__decorate([
    (0, common_1.Get)('/:storeId/store-cities'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getStorePickupCities", null);
__decorate([
    (0, common_1.Get)('/:storeId/orders-count'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getStoreOrdersCount", null);
__decorate([
    (0, common_1.Get)('/:storeId/order-stats'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Query)('filter')),
    __param(2, (0, common_1.Query)('startDate')),
    __param(3, (0, common_1.Query)('endDate')),
    __param(4, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Date,
        Date, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderStatsByStoreId", null);
__decorate([
    (0, common_1.Post)('/:storeId/:orderCode/order-entries'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Param)('orderCode')),
    __param(1, (0, common_1.Param)('storeId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "saveOrderEntries", null);
__decorate([
    (0, common_1.Get)('/order-entry-image/:fileName'),
    __param(0, (0, common_1.Param)('fileName')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderEntryImage", null);
__decorate([
    (0, common_1.Get)('/order-image/:fileName'),
    __param(0, (0, common_1.Param)('fileName')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderImage", null);
__decorate([
    (0, common_1.Delete)('/order-entry-image/:orderEntryImageId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('orderEntryImageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "deleteOrderEntryImage", null);
__decorate([
    (0, common_1.Delete)('/order-image/:orderEntryImageId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('orderEntryImageId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "deleteOrderImage", null);
__decorate([
    (0, common_1.Post)('/:storeId/:orderCode/:productCode/order-entry-image'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Param)('orderCode')),
    __param(2, (0, common_1.Param)('storeId')),
    __param(3, (0, common_1.Param)('productCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "saveOrderEntryImage", null);
__decorate([
    (0, common_1.Post)('/:storeId/:orderCode/order-image'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image')),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Param)('orderCode')),
    __param(2, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "saveOrderImage", null);
__decorate([
    (0, common_1.Get)('/:orderCode/order-entries'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('orderCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getOrderEntries", null);
__decorate([
    (0, common_1.Get)('/:storeId/:state'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Param)('state')),
    __param(2, (0, common_1.Query)('q')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('town')),
    __param(6, (0, common_1.Query)('dateFrom')),
    __param(7, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getStoreOrders", null);
__decorate([
    (0, common_1.Post)('/accept-all-orders/:storeId/:state'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Query)('town')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "acceptAllOrders", null);
__decorate([
    (0, common_1.Post)('/accept-decline-order/:storeId/:state'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Body)('orderId')),
    __param(2, (0, common_1.Body)('orderCode')),
    __param(3, (0, common_1.Body)('accept')),
    __param(4, (0, common_1.Body)('cancelReason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Boolean, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "acceptOrder", null);
__decorate([
    (0, common_1.Post)('/order-issuing/:storeId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Body)('orderId')),
    __param(2, (0, common_1.Body)('securityCode')),
    __param(3, (0, common_1.Body)('sendCode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Boolean]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "orderIssuing", null);
__decorate([
    (0, common_1.Post)('generate-invoices/:storeId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBody)({
        type: [String],
        required: true,
    }),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Array]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "generateInvoices", null);
__decorate([
    (0, common_1.Post)('get-invoices/:orderId/:printerType'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('orderId')),
    __param(1, (0, common_1.Param)('printerType')),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Array, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getInvoices", null);
__decorate([
    (0, common_1.Get)('/:productId/orders'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('productId')),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getProductOrders", null);
__decorate([
    (0, common_1.Get)('/:storeId/orders-history/:productId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Param)('productId')),
    __param(2, (0, common_1.Query)('filterFromDate')),
    __param(3, (0, common_1.Query)('filterToDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getProductOrdersHistory", null);
__decorate([
    (0, common_1.Patch)(':orderCode'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('orderCode')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_order_dto_1.UpdateOrderDto, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "updateOrder", null);
__decorate([
    (0, common_1.Get)('/get-excel/:storeId/:state'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Param)('state')),
    __param(2, (0, common_1.Query)('cityId')),
    __param(3, (0, common_1.Query)('filterFromDate')),
    __param(4, (0, common_1.Query)('filterToDate')),
    __param(5, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getExcel", null);
__decorate([
    (0, common_1.Get)('/refunds/:storeId/:state'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Param)('state')),
    __param(2, (0, common_1.Query)('query')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __param(5, (0, common_1.Query)('town')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getStoreRefunds", null);
__decorate([
    (0, common_1.Get)('/refunds-count/:storeId'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getStoreRefundsCount", null);
__decorate([
    (0, common_1.Get)('/refund/:applicationNumber/order-entries'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('applicationNumber')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getRefundEntries", null);
__decorate([
    (0, common_1.Post)('/phone/send/:storeId/:orderId'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Param)('orderId')),
    __param(2, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "sendStoreCode", null);
__decorate([
    (0, common_1.Post)('/phone/verify'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_id_decorator_1.UserId)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [verify_order_recieving_dto_1.VerifyOrderRecievingDto, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "verifyPhoneNumber", null);
__decorate([
    (0, common_1.Post)('/complete-order/:orderId'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('orderId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "completeOrder", null);
__decorate([
    (0, common_1.Get)('/ss-tap/orders-count/:storeId'),
    (0, common_1.HttpCode)(200),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getSSOrdersCount", null);
__decorate([
    (0, common_1.Get)('/ss-tap/:storeId/:state'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __param(0, (0, common_1.Param)('storeId')),
    __param(1, (0, common_1.Param)('state')),
    __param(2, (0, common_1.Query)('page')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('town')),
    __param(5, (0, common_1.Query)('dateFrom')),
    __param(6, (0, common_1.Query)('dateTo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OrderController.prototype, "getStoreSSOrders", null);
OrderController = __decorate([
    (0, common_1.Controller)('order'),
    (0, swagger_1.ApiTags)('Order'),
    __metadata("design:paramtypes", [order_service_1.OrderService, action_service_1.ActionService])
], OrderController);
exports.OrderController = OrderController;
//# sourceMappingURL=order.controller.js.map