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
exports.RefundModel = void 0;
const mongoose_1 = require("mongoose");
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
class RefundModel extends defaultClasses_1.TimeStamps {
}
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], RefundModel.prototype, "storeId", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], RefundModel.prototype, "refundId", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], RefundModel.prototype, "applicationNumber", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], RefundModel.prototype, "responsible", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], RefundModel.prototype, "order", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], RefundModel.prototype, "customerId", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], RefundModel.prototype, "customerName", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], RefundModel.prototype, "customerPhone", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Object)
], RefundModel.prototype, "refundReason", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], RefundModel.prototype, "deliveryType", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], RefundModel.prototype, "refundTab", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Object)
], RefundModel.prototype, "address", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Object)
], RefundModel.prototype, "orderAddress", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], RefundModel.prototype, "productSku", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", Number)
], RefundModel.prototype, "quantity", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", Number)
], RefundModel.prototype, "productPrice", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", Number)
], RefundModel.prototype, "total", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", Number)
], RefundModel.prototype, "totalWithdraw", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", Number)
], RefundModel.prototype, "weight", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], RefundModel.prototype, "unit", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: '' }),
    __metadata("design:type", String)
], RefundModel.prototype, "rejectDescription", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", String)
], RefundModel.prototype, "comment", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", String)
], RefundModel.prototype, "stepDescription", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", Boolean)
], RefundModel.prototype, "examinationProtocolExist", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", Array)
], RefundModel.prototype, "actions", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", Array)
], RefundModel.prototype, "stateSteps", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", Array)
], RefundModel.prototype, "imageUrls", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Date)
], RefundModel.prototype, "orderCompletionDate", void 0);
__decorate([
    (0, typegoose_1.prop)(),
    __metadata("design:type", Number)
], RefundModel.prototype, "daysCountBetweenRefundCreationAndOrderCompletion", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true }),
    __metadata("design:type", Date)
], RefundModel.prototype, "createdDate", void 0);
exports.RefundModel = RefundModel;
//# sourceMappingURL=refund.model.js.map