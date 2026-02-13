"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const user_model_1 = require("./user.model");
const user_service_1 = require("./user.service");
const config_1 = require("@nestjs/config");
const not_verified_user_model_1 = require("./not-verified-user.model");
const user_referral_model_1 = require("./user-referral/user-referral.model");
const user_referral_service_1 = require("./user-referral/user-referral.service");
const user_controller_1 = require("./user.controller");
const user_cid_history_model_1 = require("./user-cid-history.model");
const payment_model_1 = require("../payment/payment.model");
const referral_payment_model_1 = require("../payment/referral-payment.model");
const store_model_1 = require("../store/store.model");
const user_agreement_model_1 = require("./user-agreement.model");
let UserModule = class UserModule {
};
UserModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_typegoose_1.TypegooseModule.forFeature([
                {
                    typegooseClass: user_model_1.UserModel,
                    schemaOptions: {
                        collection: 'User',
                    },
                },
                {
                    typegooseClass: not_verified_user_model_1.NotVerifiedUserModel,
                    schemaOptions: {
                        collection: 'NotVerifiedUser',
                    },
                },
                {
                    typegooseClass: user_referral_model_1.UserReferralModel,
                    schemaOptions: {
                        collection: 'UserReferral',
                    },
                },
                {
                    typegooseClass: user_cid_history_model_1.UserCidHistoryModel,
                    schemaOptions: {
                        collection: 'UserCidHistory',
                    },
                },
                {
                    typegooseClass: payment_model_1.PaymentModel,
                    schemaOptions: {
                        collection: 'Payment',
                    },
                },
                {
                    typegooseClass: referral_payment_model_1.ReferralPaymentModel,
                    schemaOptions: {
                        collection: 'ReferralPayment'
                    }
                },
                {
                    typegooseClass: store_model_1.StoreModel,
                    schemaOptions: {
                        collection: 'Store',
                    },
                },
                {
                    typegooseClass: user_agreement_model_1.UserAgreementModel,
                    schemaOptions: {
                        collection: 'UserAcceptedAgreement',
                    },
                },
            ]),
            config_1.ConfigModule,
        ],
        providers: [user_service_1.UserService, user_referral_service_1.UserReferralService],
        exports: [user_service_1.UserService],
        controllers: [user_controller_1.UserController],
    })
], UserModule);
exports.UserModule = UserModule;
//# sourceMappingURL=user.module.js.map