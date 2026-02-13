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
exports.OrderProductEntryModel = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
class OrderProductEntryModel extends defaultClasses_1.TimeStamps {
}
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], OrderProductEntryModel.prototype, "orderId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], OrderProductEntryModel.prototype, "productName", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], OrderProductEntryModel.prototype, "deliveryCost", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], OrderProductEntryModel.prototype, "orderCode", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], OrderProductEntryModel.prototype, "productCode", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], OrderProductEntryModel.prototype, "productId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, required: true }),
    __metadata("design:type", Number)
], OrderProductEntryModel.prototype, "quantity", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, required: true }),
    __metadata("design:type", Number)
], OrderProductEntryModel.prototype, "totalPrice", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, required: true }),
    __metadata("design:type", Number)
], OrderProductEntryModel.prototype, "basePrice", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Object, required: true }),
    __metadata("design:type", Object)
], OrderProductEntryModel.prototype, "category", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, required: true }),
    __metadata("design:type", Number)
], OrderProductEntryModel.prototype, "weight", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], OrderProductEntryModel.prototype, "comment", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], OrderProductEntryModel.prototype, "barCode", void 0);
exports.OrderProductEntryModel = OrderProductEntryModel;
//# sourceMappingURL=order-product-entry.model.js.map