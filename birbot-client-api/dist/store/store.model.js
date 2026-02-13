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
exports.StoreModel = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const mongoose_1 = require("mongoose");
class MainCity {
}
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '750000000' }),
    __metadata("design:type", String)
], MainCity.prototype, "id", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: 'Алматы' }),
    __metadata("design:type", String)
], MainCity.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], MainCity.prototype, "isDempingOnlyThisCity", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '750000000' }),
    __metadata("design:type", String)
], MainCity.prototype, "dempingCityId", void 0);
class StoreModel extends defaultClasses_1.TimeStamps {
}
__decorate([
    (0, typegoose_1.prop)({
        type: () => mongoose_1.Types.ObjectId,
        required: true,
    }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], StoreModel.prototype, "marketplaceId", void 0);
__decorate([
    (0, typegoose_1.prop)({
        type: () => mongoose_1.Types.ObjectId,
        required: true,
    }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], StoreModel.prototype, "userId", void 0);
__decorate([
    (0, typegoose_1.prop)({
        type: () => Date,
        required: true,
    }),
    __metadata("design:type", Date)
], StoreModel.prototype, "expireDate", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: false, default: '' }),
    __metadata("design:type", String)
], StoreModel.prototype, "login", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: false, default: '' }),
    __metadata("design:type", String)
], StoreModel.prototype, "password", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], StoreModel.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], StoreModel.prototype, "slug", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], StoreModel.prototype, "storeId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], StoreModel.prototype, "logo", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], StoreModel.prototype, "url", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: true }),
    __metadata("design:type", Boolean)
], StoreModel.prototype, "isStarted", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], StoreModel.prototype, "isProcessing", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], StoreModel.prototype, "isBadCredentials", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Date, default: null }),
    __metadata("design:type", Date)
], StoreModel.prototype, "unauthDate", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: true }),
    __metadata("design:type", Boolean)
], StoreModel.prototype, "isTest", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => MainCity, default: {} }),
    __metadata("design:type", MainCity)
], StoreModel.prototype, "mainCity", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], StoreModel.prototype, "cityLimit", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], StoreModel.prototype, "cookie", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 1 }),
    __metadata("design:type", Number)
], StoreModel.prototype, "dempingPrice", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], StoreModel.prototype, "apiToken", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], StoreModel.prototype, "isUpdatedLeadTest", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: true }),
    __metadata("design:type", Boolean)
], StoreModel.prototype, "isAutoRaise", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], StoreModel.prototype, "phone", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], StoreModel.prototype, "userAgent", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 999999 }),
    __metadata("design:type", Number)
], StoreModel.prototype, "maxDempingProducts", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String }),
    __metadata("design:type", String)
], StoreModel.prototype, "storeCode", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 5 }),
    __metadata("design:type", Number)
], StoreModel.prototype, "maxNotCompeteStoreCount", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: 'NEW' }),
    __metadata("design:type", String)
], StoreModel.prototype, "requestType", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: 'REQUEST' }),
    __metadata("design:type", String)
], StoreModel.prototype, "changePriceMethod", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Date, default: null }),
    __metadata("design:type", Date)
], StoreModel.prototype, "orderStatusExpireDate", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], StoreModel.prototype, "token", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: true }),
    __metadata("design:type", Boolean)
], StoreModel.prototype, "userStartBotAccess", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], StoreModel.prototype, "merchantOrderAccess", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: true }),
    __metadata("design:type", Boolean)
], StoreModel.prototype, "auctionAccess", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: true }),
    __metadata("design:type", Object)
], StoreModel.prototype, "isSendPhoneAuthorizationMessage", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Object)
], StoreModel.prototype, "isDempingOnLoanPeriod", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Object)
], StoreModel.prototype, "isPartcipiateInPaymentsAction", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: null }),
    __metadata("design:type", Number)
], StoreModel.prototype, "taxRegime", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: true }),
    __metadata("design:type", Boolean)
], StoreModel.prototype, "showDempingWarning", void 0);
exports.StoreModel = StoreModel;
//# sourceMappingURL=store.model.js.map