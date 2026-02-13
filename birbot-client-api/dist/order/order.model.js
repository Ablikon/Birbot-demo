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
exports.OrderModel = void 0;
const mongoose_1 = require("mongoose");
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
class OrderModel extends defaultClasses_1.TimeStamps {
}
__decorate([
    (0, typegoose_1.prop)({ type: () => mongoose_1.Types.ObjectId, required: true }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], OrderModel.prototype, "storeId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], OrderModel.prototype, "orderId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], OrderModel.prototype, "totalPrice", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], OrderModel.prototype, "customerFirstName", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], OrderModel.prototype, "customerLastName", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], OrderModel.prototype, "customerPhone", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], OrderModel.prototype, "deliveryAddress", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], OrderModel.prototype, "deliveryCost", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], OrderModel.prototype, "deliveryMode", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], OrderModel.prototype, "town", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], OrderModel.prototype, "orderCode", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], OrderModel.prototype, "productId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], OrderModel.prototype, "productName", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], OrderModel.prototype, "productCode", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Array, default: [] }),
    __metadata("design:type", Array)
], OrderModel.prototype, "products", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], OrderModel.prototype, "quantity", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], OrderModel.prototype, "state", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], OrderModel.prototype, "status", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Date, required: true }),
    __metadata("design:type", Date)
], OrderModel.prototype, "creationDate", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Date, default: null }),
    __metadata("design:type", Date)
], OrderModel.prototype, "completedDate", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], OrderModel.prototype, "url", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Object, default: null }),
    __metadata("design:type", Object)
], OrderModel.prototype, "category", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], OrderModel.prototype, "addressDisplayName", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], OrderModel.prototype, "comment", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], OrderModel.prototype, "reviewsSent", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], OrderModel.prototype, "orderInfoSent", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], OrderModel.prototype, "taplinkSent", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: false }),
    __metadata("design:type", Boolean)
], OrderModel.prototype, "fromSSTap", void 0);
exports.OrderModel = OrderModel;
//# sourceMappingURL=order.model.js.map