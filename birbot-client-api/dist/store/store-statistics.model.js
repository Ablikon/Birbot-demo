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
exports.StoreStatisticsModel = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const mongoose_1 = require("mongoose");
class StoreStatisticsModel extends defaultClasses_1.TimeStamps {
}
__decorate([
    (0, typegoose_1.prop)({ type: () => mongoose_1.Types.ObjectId, required: true, unique: true }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], StoreStatisticsModel.prototype, "storeId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: Array, default: [] }),
    __metadata("design:type", Array)
], StoreStatisticsModel.prototype, "topSellingProducts", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: Array, default: [] }),
    __metadata("design:type", Array)
], StoreStatisticsModel.prototype, "topPoorlySellingProducts", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: Array, default: [] }),
    __metadata("design:type", Array)
], StoreStatisticsModel.prototype, "topMarginProducts", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: Array, default: [] }),
    __metadata("design:type", Array)
], StoreStatisticsModel.prototype, "topLowMarginProducts", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: Array, default: [] }),
    __metadata("design:type", Array)
], StoreStatisticsModel.prototype, "topLowSellingCities", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: Array, default: [] }),
    __metadata("design:type", Array)
], StoreStatisticsModel.prototype, "topSellingCities", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: Array, default: [] }),
    __metadata("design:type", Array)
], StoreStatisticsModel.prototype, "topHighlyCompetitiveProducts", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], StoreStatisticsModel.prototype, "todayProfit", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], StoreStatisticsModel.prototype, "yesterdayProfit", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], StoreStatisticsModel.prototype, "weekProfit", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], StoreStatisticsModel.prototype, "monthProfit", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0 }),
    __metadata("design:type", Number)
], StoreStatisticsModel.prototype, "rangeDataProfit", void 0);
exports.StoreStatisticsModel = StoreStatisticsModel;
//# sourceMappingURL=store-statistics.model.js.map