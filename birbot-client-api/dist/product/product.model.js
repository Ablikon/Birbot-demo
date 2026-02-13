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
exports.ProductModel = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const mongoose_1 = require("mongoose");
class CityData {
}
__decorate([
    (0, typegoose_1.prop)({ required: true, type: () => String }),
    __metadata("design:type", String)
], CityData.prototype, "id", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true, type: () => String }),
    __metadata("design:type", String)
], CityData.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true, type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], CityData.prototype, "minPrice", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true, type: () => Object, default: {} }),
    __metadata("design:type", Object)
], CityData.prototype, "priceRow", void 0);
class CityPrices {
}
__decorate([
    (0, typegoose_1.prop)({ required: true, type: () => String }),
    __metadata("design:type", String)
], CityPrices.prototype, "cityId", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true, type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], CityPrices.prototype, "value", void 0);
class ProductModel extends defaultClasses_1.TimeStamps {
}
__decorate([
    (0, typegoose_1.prop)({ type: () => mongoose_1.Types.ObjectId }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], ProductModel.prototype, "configId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => mongoose_1.Types.ObjectId }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], ProductModel.prototype, "storeId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], ProductModel.prototype, "sku", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], ProductModel.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, required: true }),
    __metadata("design:type", Number)
], ProductModel.prototype, "price", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], ProductModel.prototype, "availableMinPrice", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 999999999 }),
    __metadata("design:type", Number)
], ProductModel.prototype, "availableMaxPrice", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], ProductModel.prototype, "isUpdateEveryWeek", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], ProductModel.prototype, "isSetMinPrice", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String }),
    __metadata("design:type", String)
], ProductModel.prototype, "url", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], ProductModel.prototype, "brand", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], ProductModel.prototype, "category", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], ProductModel.prototype, "img", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: false }),
    __metadata("design:type", Boolean)
], ProductModel.prototype, "isDemping", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: false }),
    __metadata("design:type", Boolean)
], ProductModel.prototype, "isChanging", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true, type: () => Object }),
    __metadata("design:type", Object)
], ProductModel.prototype, "masterProduct", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Array, default: [] }),
    __metadata("design:type", Array)
], ProductModel.prototype, "cityData", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Array, default: [] }),
    __metadata("design:type", Array)
], ProductModel.prototype, "cityPrices", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Array, default: [] }),
    __metadata("design:type", Array)
], ProductModel.prototype, "newCityData", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: true, required: true }),
    __metadata("design:type", Boolean)
], ProductModel.prototype, "isActive", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], ProductModel.prototype, "amount", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], ProductModel.prototype, "isAmountChanged", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], ProductModel.prototype, "isWithdrawFromSale", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], ProductModel.prototype, "place", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], ProductModel.prototype, "isMinus", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Date, default: null }),
    __metadata("design:type", Date)
], ProductModel.prototype, "lastCheckedDate", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 1 }),
    __metadata("design:type", Number)
], ProductModel.prototype, "dempingPrice", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: true }),
    __metadata("design:type", Boolean)
], ProductModel.prototype, "isAutoRaise", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], ProductModel.prototype, "orderAutoAccept", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], ProductModel.prototype, "isDempingOnlyMainCity", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: null }),
    __metadata("design:type", Number)
], ProductModel.prototype, "purchasePrice", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], ProductModel.prototype, "merchantId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 24 }),
    __metadata("design:type", Number)
], ProductModel.prototype, "loanPeriod", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: null }),
    __metadata("design:type", Number)
], ProductModel.prototype, "offersCount", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], ProductModel.prototype, "autoacceptOrder", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 10 }),
    __metadata("design:type", Number)
], ProductModel.prototype, "marginPercent", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], ProductModel.prototype, "weight", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], ProductModel.prototype, "isAuctionWinner", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: null }),
    __metadata("design:type", Number)
], ProductModel.prototype, "kaspiCabinetPosition", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: null }),
    __metadata("design:type", Number)
], ProductModel.prototype, "preOrderDays", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], ProductModel.prototype, "isPreOrder", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], ProductModel.prototype, "isBonusDemping", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 5 }),
    __metadata("design:type", Number)
], ProductModel.prototype, "bonus", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 60 }),
    __metadata("design:type", Number)
], ProductModel.prototype, "maxBonus", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 5 }),
    __metadata("design:type", Number)
], ProductModel.prototype, "minBonus", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], ProductModel.prototype, "productCampaignStatus", void 0);
exports.ProductModel = ProductModel;
//# sourceMappingURL=product.model.js.map