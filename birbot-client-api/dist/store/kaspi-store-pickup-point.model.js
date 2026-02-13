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
exports.KaspiStorePickupPointModel = exports.KaspiStorePickupPointStatusEnum = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const mongoose_1 = require("mongoose");
var KaspiStorePickupPointStatusEnum;
(function (KaspiStorePickupPointStatusEnum) {
    KaspiStorePickupPointStatusEnum["ACTIVE"] = "ACTIVE";
    KaspiStorePickupPointStatusEnum["INACTIVE"] = "INACTIVE";
})(KaspiStorePickupPointStatusEnum = exports.KaspiStorePickupPointStatusEnum || (exports.KaspiStorePickupPointStatusEnum = {}));
let KaspiStorePickupPointModel = class KaspiStorePickupPointModel {
};
__decorate([
    (0, typegoose_1.prop)({ type: () => mongoose_1.Types.ObjectId, required: true, ref: 'Store' }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], KaspiStorePickupPointModel.prototype, "storeId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], KaspiStorePickupPointModel.prototype, "formattedAddress", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true, enum: KaspiStorePickupPointStatusEnum }),
    __metadata("design:type", String)
], KaspiStorePickupPointModel.prototype, "status", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], KaspiStorePickupPointModel.prototype, "name", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], KaspiStorePickupPointModel.prototype, "displayName", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], KaspiStorePickupPointModel.prototype, "cityId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], KaspiStorePickupPointModel.prototype, "cityName", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, required: true }),
    __metadata("design:type", Boolean)
], KaspiStorePickupPointModel.prototype, "available", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, required: true }),
    __metadata("design:type", Boolean)
], KaspiStorePickupPointModel.prototype, "virtual", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, required: true }),
    __metadata("design:type", Boolean)
], KaspiStorePickupPointModel.prototype, "warehouse", void 0);
KaspiStorePickupPointModel = __decorate([
    (0, typegoose_1.modelOptions)({
        schemaOptions: {
            timestamps: true,
        },
    })
], KaspiStorePickupPointModel);
exports.KaspiStorePickupPointModel = KaspiStorePickupPointModel;
//# sourceMappingURL=kaspi-store-pickup-point.model.js.map