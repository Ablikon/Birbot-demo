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
exports.ReferralPaymentModel = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const mongoose_1 = require("mongoose");
let ReferralPaymentModel = class ReferralPaymentModel {
};
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], ReferralPaymentModel.prototype, "userId", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Number)
], ReferralPaymentModel.prototype, "price", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: false }),
    __metadata("design:type", Boolean)
], ReferralPaymentModel.prototype, "isUsed", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Date)
], ReferralPaymentModel.prototype, "createdAt", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Date)
], ReferralPaymentModel.prototype, "updatedAt", void 0);
ReferralPaymentModel = __decorate([
    (0, typegoose_1.modelOptions)({ schemaOptions: { timestamps: true } })
], ReferralPaymentModel);
exports.ReferralPaymentModel = ReferralPaymentModel;
//# sourceMappingURL=referral-payment.model.js.map