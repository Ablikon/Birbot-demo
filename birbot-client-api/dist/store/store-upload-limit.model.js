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
exports.KaspiStoreUploadLimitModel = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
class KaspiStoreUploadLimitModel extends defaultClasses_1.TimeStamps {
}
__decorate([
    (0, typegoose_1.prop)({ type: () => String, required: true, unique: true }),
    __metadata("design:type", String)
], KaspiStoreUploadLimitModel.prototype, "merchantId", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: String }),
    __metadata("design:type", String)
], KaspiStoreUploadLimitModel.prototype, "limitType", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: Number }),
    __metadata("design:type", Number)
], KaspiStoreUploadLimitModel.prototype, "uploadedCount", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: Date, default: [] }),
    __metadata("design:type", Date)
], KaspiStoreUploadLimitModel.prototype, "expirationDate", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: Boolean, default: [] }),
    __metadata("design:type", Boolean)
], KaspiStoreUploadLimitModel.prototype, "unlimited", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: Number, default: [] }),
    __metadata("design:type", Number)
], KaspiStoreUploadLimitModel.prototype, "maxCount", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: Date, default: [] }),
    __metadata("design:type", Date)
], KaspiStoreUploadLimitModel.prototype, "actualizedFromKaspiDate", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: Boolean, default: [] }),
    __metadata("design:type", Boolean)
], KaspiStoreUploadLimitModel.prototype, "isUploading", void 0);
exports.KaspiStoreUploadLimitModel = KaspiStoreUploadLimitModel;
//# sourceMappingURL=store-upload-limit.model.js.map