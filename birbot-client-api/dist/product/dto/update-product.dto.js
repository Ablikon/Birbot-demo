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
exports.UpdateProductDto = exports.UpdateProductWarehouseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class UpdateProductWarehouseDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        required: true,
        description: 'ID товара',
    }),
    __metadata("design:type", String)
], UpdateProductWarehouseDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({
        required: true,
        description: 'ID Склада',
    }),
    __metadata("design:type", String)
], UpdateProductWarehouseDto.prototype, "storePickupPointId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Остаток',
    }),
    __metadata("design:type", Number)
], UpdateProductWarehouseDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Предзаказ (день)',
    }),
    __metadata("design:type", Number)
], UpdateProductWarehouseDto.prototype, "preOrder", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Наличие в складе',
    }),
    __metadata("design:type", Boolean)
], UpdateProductWarehouseDto.prototype, "available", void 0);
exports.UpdateProductWarehouseDto = UpdateProductWarehouseDto;
class UpdateProductDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'ID города',
    }),
    __metadata("design:type", String)
], UpdateProductDto.prototype, "cityId", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'цена',
    }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "price", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Мин. цена',
    }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "availableMinPrice", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Макс. цена',
    }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "availableMaxPrice", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Обновить каждую неделю',
    }),
    __metadata("design:type", Boolean)
], UpdateProductDto.prototype, "isUpdateEveryWeek", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Если цена дошла до мин. цены, бороться за 2-5 места или поставить мин. цену',
    }),
    __metadata("design:type", Boolean)
], UpdateProductDto.prototype, "isSetMinPrice", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Остаток',
    }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "amount", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Снять с продажи, когда нет в наличии',
    }),
    __metadata("design:type", Boolean)
], UpdateProductDto.prototype, "isWithdrawFromSale", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Вкл/выкл автоснижение',
    }),
    __metadata("design:type", Boolean)
], UpdateProductDto.prototype, "isDemping", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Автоподнятие цены',
    }),
    __metadata("design:type", Boolean)
], UpdateProductDto.prototype, "isAutoRaise", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Шаг снижение цены',
    }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "dempingPrice", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => UpdateProductWarehouseDto),
    (0, class_validator_1.ValidateNested)({
        each: true,
    }),
    (0, swagger_1.ApiProperty)({
        type: [UpdateProductWarehouseDto],
    }),
    __metadata("design:type", Array)
], UpdateProductDto.prototype, "productWarehouses", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Автопринятия заказа',
    }),
    __metadata("design:type", Boolean)
], UpdateProductDto.prototype, "orderAutoAccept", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Снижать только в гл. городе. Да/нет',
    }),
    __metadata("design:type", Boolean)
], UpdateProductDto.prototype, "isDempingOnlyMainCity", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Закупочная цена',
    }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "purchasePrice", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Автопринятие заказа',
    }),
    __metadata("design:type", Boolean)
], UpdateProductDto.prototype, "autoacceptOrder", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'предзаказ',
    }),
    __metadata("design:type", Boolean)
], UpdateProductDto.prototype, "isPreOrder", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'дни предзаказа',
    }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "preOrderDays", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "marginPercent", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Бонус',
    }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "bonus", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Минимальный бонус',
    }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "minBonus", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Максимальный бонус',
    }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "maxBonus", void 0);
__decorate([
    (0, class_validator_1.IsBoolean)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Бонусный демпинг',
    }),
    __metadata("design:type", Boolean)
], UpdateProductDto.prototype, "isBonusDemping", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    (0, swagger_1.ApiProperty)({
        description: 'Период рассрочки',
    }),
    __metadata("design:type", Number)
], UpdateProductDto.prototype, "loanPeriod", void 0);
exports.UpdateProductDto = UpdateProductDto;
//# sourceMappingURL=update-product.dto.js.map