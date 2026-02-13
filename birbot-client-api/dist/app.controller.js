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
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const jwt_guard_1 = require("./auth/guards/jwt.guard");
const fs_1 = require("fs");
const swagger_1 = require("@nestjs/swagger");
const marketplace_city_model_1 = require("./city/marketplace-city.model");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const mongoose_1 = require("mongoose");
const path = require("path");
const fs = require("fs");
let AppController = class AppController {
    constructor(appService, marketplaceCityModel) {
        this.appService = appService;
        this.marketplaceCityModel = marketplaceCityModel;
    }
    async getKaspiCities() {
        return await this.marketplaceCityModel.find().select({ id: 1, name: 1 });
    }
    async getKaspiManagerStep1(res) {
        const path = './src/assets/kaspi-manager/step-1.jpeg';
        if (!fs_1.existsSync) {
            throw new common_1.NotFoundException();
        }
        res.download(path);
    }
    async getKaspiManagerStep2(res) {
        const path = './src/assets/kaspi-manager/step-2.jpeg';
        if (!fs_1.existsSync) {
            throw new common_1.NotFoundException();
        }
        res.download(path);
    }
    async getMemoryUsage(res) {
        const filePath = await this.appService.getMemoryUsage();
        const fileName = path.basename(filePath);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    }
};
__decorate([
    (0, common_1.Get)('kaspi/cities'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getKaspiCities", null);
__decorate([
    (0, common_1.Get)('kaspi/manager/step-1'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getKaspiManagerStep1", null);
__decorate([
    (0, common_1.Get)('kaspi/manager/step-2'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getKaspiManagerStep2", null);
__decorate([
    (0, common_1.Get)('create-heapdump'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "getMemoryUsage", null);
AppController = __decorate([
    (0, common_1.Controller)(),
    (0, swagger_1.ApiTags)('Constants'),
    __param(1, (0, nestjs_typegoose_1.InjectModel)(marketplace_city_model_1.MarketplaceCityModel)),
    __metadata("design:paramtypes", [app_service_1.AppService,
        mongoose_1.Model])
], AppController);
exports.AppController = AppController;
//# sourceMappingURL=app.controller.js.map