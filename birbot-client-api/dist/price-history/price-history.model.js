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
exports.PriceHistoryModel = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const mongoose_1 = require("mongoose");
class PriceModel {
}
__decorate([
    (0, typegoose_1.prop)({ type: () => Number }),
    __metadata("design:type", Number)
], PriceModel.prototype, "new", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number }),
    __metadata("design:type", Number)
], PriceModel.prototype, "old", void 0);
class StoresModel {
}
__decorate([
    (0, typegoose_1.prop)({ type: () => String }),
    __metadata("design:type", String)
], StoresModel.prototype, "id", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String }),
    __metadata("design:type", String)
], StoresModel.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String }),
    __metadata("design:type", String)
], StoresModel.prototype, "shopLink", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number }),
    __metadata("design:type", Number)
], StoresModel.prototype, "price", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number }),
    __metadata("design:type", Number)
], StoresModel.prototype, "rating", void 0);
class PriceHistoryModel extends defaultClasses_1.TimeStamps {
}
__decorate([
    (0, typegoose_1.prop)({ type: () => mongoose_1.Types.ObjectId }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], PriceHistoryModel.prototype, "userId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => mongoose_1.Types.ObjectId }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], PriceHistoryModel.prototype, "storeId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String }),
    __metadata("design:type", String)
], PriceHistoryModel.prototype, "sku", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => PriceModel, required: true }),
    __metadata("design:type", PriceModel)
], PriceHistoryModel.prototype, "price", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => StoresModel }),
    __metadata("design:type", Array)
], PriceHistoryModel.prototype, "stores", void 0);
exports.PriceHistoryModel = PriceHistoryModel;
//# sourceMappingURL=price-history.model.js.map