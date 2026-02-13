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
exports.ProductDeliveryDurationModel = exports.ProductDeliveryDurationEnum = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const mongoose_1 = require("mongoose");
var ProductDeliveryDurationEnum;
(function (ProductDeliveryDurationEnum) {
    ProductDeliveryDurationEnum["EXPRESS"] = "EXPRESS";
    ProductDeliveryDurationEnum["TODAY"] = "TODAY";
    ProductDeliveryDurationEnum["TOMORROW"] = "TOMORROW";
    ProductDeliveryDurationEnum["TILL_2_DAYS"] = "TILL_2_DAYS";
    ProductDeliveryDurationEnum["TILL_5_DAYS"] = "TILL_5_DAYS";
    ProductDeliveryDurationEnum["TILL_7_DAYS"] = "TILL_7_DAYS";
    ProductDeliveryDurationEnum["OTHER"] = "OTHER";
    ProductDeliveryDurationEnum["ALL"] = "ALL";
})(ProductDeliveryDurationEnum = exports.ProductDeliveryDurationEnum || (exports.ProductDeliveryDurationEnum = {}));
class ProductDeliveryDurationModel extends defaultClasses_1.TimeStamps {
}
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true }),
    __metadata("design:type", String)
], ProductDeliveryDurationModel.prototype, "sku", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => mongoose_1.Types.ObjectId, required: true }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], ProductDeliveryDurationModel.prototype, "storeId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => [Object], default: [], required: true }),
    __metadata("design:type", Array)
], ProductDeliveryDurationModel.prototype, "deliveryDuration", void 0);
exports.ProductDeliveryDurationModel = ProductDeliveryDurationModel;
//# sourceMappingURL=product-delivery-duration.model.js.map