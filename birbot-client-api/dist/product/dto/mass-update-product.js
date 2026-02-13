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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MassUpdateProductsDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class MassUpdateProductsDto {
}
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, swagger_1.ApiProperty)({ required: true }),
    __metadata("design:type", Array)
], MassUpdateProductsDto.prototype, "productsId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({}),
    __metadata("design:type", Boolean)
], MassUpdateProductsDto.prototype, "isDemping", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({}),
    __metadata("design:type", Boolean)
], MassUpdateProductsDto.prototype, "isSetMinPrice", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({}),
    __metadata("design:type", Boolean)
], MassUpdateProductsDto.prototype, "isAutoRaise", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({}),
    __metadata("design:type", Boolean)
], MassUpdateProductsDto.prototype, "isUpdateEveryWeek", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({}),
    __metadata("design:type", Boolean)
], MassUpdateProductsDto.prototype, "isDempingOnlyMainCity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({}),
    __metadata("design:type", Boolean)
], MassUpdateProductsDto.prototype, "isLoading", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({}),
    __metadata("design:type", Number)
], MassUpdateProductsDto.prototype, "dempingPrice", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({}),
    __metadata("design:type", Boolean)
], MassUpdateProductsDto.prototype, "isApplyDempingPriceToEverything", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({}),
    __metadata("design:type", String)
], MassUpdateProductsDto.prototype, "choosedFilter", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({}),
    __metadata("design:type", Boolean)
], MassUpdateProductsDto.prototype, "isWithdrawFromSale", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({}),
    __metadata("design:type", Boolean)
], MassUpdateProductsDto.prototype, "autoacceptOrder", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, swagger_1.ApiProperty)({}),
    __metadata("design:type", String)
], MassUpdateProductsDto.prototype, "isSelectedCityId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, swagger_1.ApiProperty)({}),
    __metadata("design:type", Array)
], MassUpdateProductsDto.prototype, "preorderDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({
        description: 'Бонус',
    }),
    __metadata("design:type", Number)
], MassUpdateProductsDto.prototype, "bonus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({
        description: 'Минимальный бонус',
    }),
    __metadata("design:type", Number)
], MassUpdateProductsDto.prototype, "minBonus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, swagger_1.ApiProperty)({
        description: 'Максимальный бонус',
    }),
    __metadata("design:type", Number)
], MassUpdateProductsDto.prototype, "maxBonus", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, swagger_1.ApiProperty)({
        description: 'Бонусный демпинг',
    }),
    __metadata("design:type", Boolean)
], MassUpdateProductsDto.prototype, "isBonusDemping", void 0);
exports.MassUpdateProductsDto = MassUpdateProductsDto;
//# sourceMappingURL=mass-update-product.js.map