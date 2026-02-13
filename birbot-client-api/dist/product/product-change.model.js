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
exports.ProductChangeModel = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const mongoose_1 = require("mongoose");
class ProductChangeModel extends defaultClasses_1.TimeStamps {
}
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], ProductChangeModel.prototype, "sku", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, required: true }),
    __metadata("design:type", Number)
], ProductChangeModel.prototype, "oldPrice", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], ProductChangeModel.prototype, "newPrice", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Date, required: true }),
    __metadata("design:type", Date)
], ProductChangeModel.prototype, "startChangingDate", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Date, default: null }),
    __metadata("design:type", Date)
], ProductChangeModel.prototype, "changedDate", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], ProductChangeModel.prototype, "time", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => mongoose_1.Types.ObjectId, required: true }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], ProductChangeModel.prototype, "storeId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], ProductChangeModel.prototype, "storeName", void 0);
exports.ProductChangeModel = ProductChangeModel;
//# sourceMappingURL=product-change.model.js.map