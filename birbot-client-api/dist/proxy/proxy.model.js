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
exports.ProxyModel = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const mongoose_1 = require("mongoose");
class ProxyModel extends defaultClasses_1.TimeStamps {
}
__decorate([
    (0, typegoose_1.prop)({ required: true, type: () => mongoose_1.Types.ObjectId }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], ProxyModel.prototype, "userId", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: '', type: () => String }),
    __metadata("design:type", String)
], ProxyModel.prototype, "login", void 0);
__decorate([
    (0, typegoose_1.prop)({ default: '', type: () => String }),
    __metadata("design:type", String)
], ProxyModel.prototype, "password", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true, type: () => String }),
    __metadata("design:type", String)
], ProxyModel.prototype, "proxy", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true, type: () => String }),
    __metadata("design:type", String)
], ProxyModel.prototype, "host", void 0);
__decorate([
    (0, typegoose_1.prop)({ required: true, type: () => Number }),
    __metadata("design:type", Number)
], ProxyModel.prototype, "port", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Boolean, default: true }),
    __metadata("design:type", Boolean)
], ProxyModel.prototype, "isActive", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => Number, default: 0, required: true }),
    __metadata("design:type", Number)
], ProxyModel.prototype, "usedCount", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => String, default: 'MERCHANTCABINET' }),
    __metadata("design:type", String)
], ProxyModel.prototype, "type", void 0);
exports.ProxyModel = ProxyModel;
//# sourceMappingURL=proxy.model.js.map