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
exports.ProductCityModel = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const mongoose_1 = require("mongoose");
class ProductCityModel extends defaultClasses_1.TimeStamps {
}
__decorate([
    (0, typegoose_1.prop)({ type: () => mongoose_1.Types.ObjectId, required: true }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], ProductCityModel.prototype, "storeCityId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => mongoose_1.Types.ObjectId, required: true }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], ProductCityModel.prototype, "productId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], ProductCityModel.prototype, "availableMinPrice", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 999999999 }),
    __metadata("design:type", Number)
], ProductCityModel.prototype, "availableMaxPrice", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: true }),
    __metadata("design:type", Boolean)
], ProductCityModel.prototype, "isDemping", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean }),
    __metadata("design:type", Boolean)
], ProductCityModel.prototype, "isAutoRaise", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number }),
    __metadata("design:type", Number)
], ProductCityModel.prototype, "dempingPrice", void 0);
exports.ProductCityModel = ProductCityModel;
//# sourceMappingURL=product-city.model.js.map