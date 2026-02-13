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
exports.ProductDeliveryDurationManyDto = exports.ProductDeliveryDurationDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
class ProductDeliveryDurationDto {
}
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, swagger_1.ApiProperty)({}),
    __metadata("design:type", Array)
], ProductDeliveryDurationDto.prototype, "deliveryDurations", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, swagger_1.ApiProperty)({ required: true }),
    __metadata("design:type", String)
], ProductDeliveryDurationDto.prototype, "sku", void 0);
exports.ProductDeliveryDurationDto = ProductDeliveryDurationDto;
class ProductDeliveryDurationManyDto {
}
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayMinSize)(1),
    (0, swagger_1.ApiProperty)({}),
    __metadata("design:type", Array)
], ProductDeliveryDurationManyDto.prototype, "deliveryDurations", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.IsArray)(),
    (0, swagger_1.ApiProperty)({ required: true }),
    __metadata("design:type", Array)
], ProductDeliveryDurationManyDto.prototype, "sku", void 0);
exports.ProductDeliveryDurationManyDto = ProductDeliveryDurationManyDto;
//# sourceMappingURL=product-delivery-duration.dto.js.map