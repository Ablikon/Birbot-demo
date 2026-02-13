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
exports.DidNotRenewTheSubscriptionModel = exports.DidNotRenewTheSubscriptionTypeEnum = void 0;
const typegoose_1 = require("@typegoose/typegoose");
const defaultClasses_1 = require("@typegoose/typegoose/lib/defaultClasses");
const mongoose_1 = require("mongoose");
var DidNotRenewTheSubscriptionTypeEnum;
(function (DidNotRenewTheSubscriptionTypeEnum) {
    DidNotRenewTheSubscriptionTypeEnum["WEEK"] = "WEEK";
    DidNotRenewTheSubscriptionTypeEnum["MONTH"] = "MONTH";
    DidNotRenewTheSubscriptionTypeEnum["THREE_MONTH"] = "THREE_MONTH";
})(DidNotRenewTheSubscriptionTypeEnum = exports.DidNotRenewTheSubscriptionTypeEnum || (exports.DidNotRenewTheSubscriptionTypeEnum = {}));
class DidNotRenewTheSubscriptionModel extends defaultClasses_1.TimeStamps {
}
__decorate([
    (0, typegoose_1.prop)({
        type: () => String,
        enum: DidNotRenewTheSubscriptionTypeEnum,
        required: true,
    }),
    __metadata("design:type", String)
], DidNotRenewTheSubscriptionModel.prototype, "type", void 0);
__decorate([
    (0, typegoose_1.prop)({ type: () => mongoose_1.Types.ObjectId, required: true }),
    __metadata("design:type", mongoose_1.Types.ObjectId)
], DidNotRenewTheSubscriptionModel.prototype, "userId", void 0);
exports.DidNotRenewTheSubscriptionModel = DidNotRenewTheSubscriptionModel;
//# sourceMappingURL=did-not-renew-the-subscription.model.js.map