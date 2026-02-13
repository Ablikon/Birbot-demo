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
exports.PaymentModel = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const mongoose_1 = require("mongoose");
let PaymentModel = class PaymentModel {
};
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], PaymentModel.prototype, "userId", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], PaymentModel.prototype, "storeId", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Number)
], PaymentModel.prototype, "price", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], PaymentModel.prototype, "type", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Date)
], PaymentModel.prototype, "newExpireDate", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Date)
], PaymentModel.prototype, "createdAt", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Date)
], PaymentModel.prototype, "updatedAt", void 0);
PaymentModel = __decorate([
    (0, typegoose_1.modelOptions)({ schemaOptions: { timestamps: true } })
], PaymentModel);
exports.PaymentModel = PaymentModel;
//# sourceMappingURL=payment.model.js.map