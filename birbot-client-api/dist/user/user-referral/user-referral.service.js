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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserReferralService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const user_model_1 = require("../user.model");
const user_referral_model_1 = require("./user-referral.model");
const mongoose_1 = require("mongoose");
const payment_model_1 = require("../../payment/payment.model");
const referral_payment_model_1 = require("../../payment/referral-payment.model");
const randtoken = require('rand-token');
let UserReferralService = class UserReferralService {
    constructor(userReferralModel, userModel, paymentModel, referralPaymentModel) {
        this.userReferralModel = userReferralModel;
        this.userModel = userModel;
        this.paymentModel = paymentModel;
        this.referralPaymentModel = referralPaymentModel;
        this.test();
    }
    async test() {
        const users = await this.userModel.find();
        for (const user of users) {
            try {
                await this.generateCode(user._id.toString());
            }
            catch (_) { }
        }
    }
    async generateCode(userId) {
        if (!(0, mongoose_1.isValidObjectId)(userId)) {
            throw new common_1.BadRequestException();
        }
        let foundUserReferral = await this.userReferralModel.exists({
            userId,
        });
        if (foundUserReferral) {
            throw new common_1.BadRequestException();
        }
        const CODE_LENGTH = 7;
        let code = randtoken.generate(CODE_LENGTH);
        while (true) {
            foundUserReferral = await this.userReferralModel.exists({
                code,
            });
            if (!foundUserReferral) {
                break;
            }
            code = randtoken.generate(CODE_LENGTH);
        }
        await new this.userReferralModel({
            userId,
            code,
        }).save();
    }
    async getUserIdByCode(code) {
        const foundUserReferral = await this.userReferralModel.findOne({
            code,
        });
        if (foundUserReferral) {
            return foundUserReferral.userId;
        }
        return null;
    }
    async getCodeByUserId(userId) {
        const code = await this.userReferralModel.findOne({
            userId
        });
        if (code === null || code === void 0 ? void 0 : code.code) {
            return code.code;
        }
        return null;
    }
    async getUserReferrals(userId) {
        const referralStartDate = new Date('2024-11-25');
        referralStartDate.setHours(0, 0, 0, 0);
        const findedReferrals = await this.userModel.find({ referer: userId, createdAt: { $gt: referralStartDate } }).sort({ _id: -1 });
        const refCode = await this.getCodeByUserId(userId);
        const today = new Date().getTime();
        if (!findedReferrals || findedReferrals.length === 0) {
            return {
                refCode: `https://salescout.me/r/${refCode}`,
                totalRefCount: 0,
                totalIncome: 0,
                monthlyRefCount: 0,
                monthlyIncome: 0,
                balance: 0,
                referrals: []
            };
        }
        const referrals = [];
        console.log(`Total refs: ${findedReferrals.length}`);
        for (const ref of findedReferrals) {
            const payments = await this.referralPaymentModel.find({ userId: ref._id });
            if (!payments || payments.length === 0) {
                continue;
            }
            for (const payment of payments) {
                if (payment.price) {
                    referrals.push({
                        name: ref.name,
                        registrationDate: payment.createdAt,
                        income: payment.price,
                        used: payment.isUsed
                    });
                }
            }
        }
        const totalRefCount = findedReferrals.length;
        const totalIncome = referrals.reduce((sum, referral) => sum + referral.income, 0);
        const balance = referrals.reduce((sum, referral) => sum + (referral.used ? 0 : referral.income), 0);
        const monthRefs = referrals.filter((ref) => (today - ref.registrationDate.getTime()) <= 1000 * 60 * 60 * 24 * 30);
        const monthlyRefCount = monthRefs.length;
        const monthlyIncome = monthlyRefCount > 0 ? monthRefs.reduce((sum, referral) => sum + referral.income, 0) : 0;
        return {
            refCode: `https://salescout.me/r/${refCode}`,
            totalRefCount,
            balance: balance * 0.1,
            totalIncome: totalIncome * 0.1,
            monthlyRefCount,
            monthlyIncome: monthlyIncome * 0.1,
            referrals
        };
    }
    async sendReferralMoneyBackMessage(userId, value) {
        console.log(`Referral money back request: userId=${userId}, value=${value}`);
        return { success: true };
    }
};
UserReferralService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_typegoose_1.InjectModel)(user_referral_model_1.UserReferralModel)),
    __param(1, (0, nestjs_typegoose_1.InjectModel)(user_model_1.UserModel)),
    __param(2, (0, nestjs_typegoose_1.InjectModel)(payment_model_1.PaymentModel)),
    __param(3, (0, nestjs_typegoose_1.InjectModel)(referral_payment_model_1.ReferralPaymentModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], UserReferralService);
exports.UserReferralService = UserReferralService;
//# sourceMappingURL=user-referral.service.js.map