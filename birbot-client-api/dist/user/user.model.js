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
exports.UserModel = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const mongoose_1 = require("mongoose");
class UserModel extends defaultClasses_1.TimeStamps {
}
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true, unique: true }),
    __metadata("design:type", String)
], UserModel.prototype, "email", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String }),
    __metadata("design:type", String)
], UserModel.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String }),
    __metadata("design:type", String)
], UserModel.prototype, "surname", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], UserModel.prototype, "passwordHash", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 1 }),
    __metadata("design:type", Number)
], UserModel.prototype, "storeLimit", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], UserModel.prototype, "leadId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], UserModel.prototype, "contactId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], UserModel.prototype, "isRef", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], UserModel.prototype, "isBlocked", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => mongoose_1.Types.ObjectId, default: null }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], UserModel.prototype, "referer", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], UserModel.prototype, "isShowAnalytics", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], UserModel.prototype, "isShowMessage", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: null }),
    __metadata("design:type", String)
], UserModel.prototype, "cid", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], UserModel.prototype, "topStoreStatistics", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Date, default: null }),
    __metadata("design:type", Date)
], UserModel.prototype, "acceptTokensAfterDate", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 1 }),
    __metadata("design:type", Number)
], UserModel.prototype, "analyticsManagersCount", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], UserModel.prototype, "expressAnalyticsRequestCount", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], UserModel.prototype, "isNew", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], UserModel.prototype, "showNewFeature", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Object)
], UserModel.prototype, "isPartcipiateInPaymentsAction", void 0);
exports.UserModel = UserModel;
//# sourceMappingURL=user.model.js.map