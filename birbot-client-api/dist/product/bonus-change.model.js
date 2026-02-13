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
exports.BonusChangeModel = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const mongoose_1 = require("mongoose");
class BonusChangeModel extends defaultClasses_1.TimeStamps {
}
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], BonusChangeModel.prototype, "sku", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => mongoose_1.Types.ObjectId, required: true }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], BonusChangeModel.prototype, "productId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => mongoose_1.Types.ObjectId, required: true }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], BonusChangeModel.prototype, "storeId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], BonusChangeModel.prototype, "storeName", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], BonusChangeModel.prototype, "changeType", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: null }),
    __metadata("design:type", Number)
], BonusChangeModel.prototype, "oldBonusValue", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: null }),
    __metadata("design:type", Number)
], BonusChangeModel.prototype, "newBonusValue", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: null }),
    __metadata("design:type", Boolean)
], BonusChangeModel.prototype, "oldBooleanValue", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: null }),
    __metadata("design:type", Boolean)
], BonusChangeModel.prototype, "newBooleanValue", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Date, required: true, default: () => new Date() }),
    __metadata("design:type", Date)
], BonusChangeModel.prototype, "changeDate", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: 'MANUAL' }),
    __metadata("design:type", String)
], BonusChangeModel.prototype, "changeMethod", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: null }),
    __metadata("design:type", String)
], BonusChangeModel.prototype, "changedBy", void 0);
exports.BonusChangeModel = BonusChangeModel;
//# sourceMappingURL=bonus-change.model.js.map