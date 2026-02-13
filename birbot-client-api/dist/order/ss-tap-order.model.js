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
exports.SSTapOrderModel = void 0;
const mongoose_1 = require("mongoose");
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
class SSTapOrderModel extends defaultClasses_1.TimeStamps {
}
__decorate([
    (0, typegoose_1.prop)({ type: () => mongoose_1.Types.ObjectId, required: true }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], SSTapOrderModel.prototype, "storeId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], SSTapOrderModel.prototype, "totalPrice", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], SSTapOrderModel.prototype, "customerFirstName", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], SSTapOrderModel.prototype, "customerLastName", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], SSTapOrderModel.prototype, "customerPhone", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], SSTapOrderModel.prototype, "deliveryAddress", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: '' }),
    __metadata("design:type", String)
], SSTapOrderModel.prototype, "state", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Date, required: true }),
    __metadata("design:type", Date)
], SSTapOrderModel.prototype, "creationDate", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Date, default: null }),
    __metadata("design:type", Date)
], SSTapOrderModel.prototype, "completedDate", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Array, default: [] }),
    __metadata("design:type", Array)
], SSTapOrderModel.prototype, "products", void 0);
exports.SSTapOrderModel = SSTapOrderModel;
//# sourceMappingURL=ss-tap-order.model.js.map