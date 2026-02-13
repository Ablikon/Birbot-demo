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
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const bcryptjs_1 = require("bcryptjs");
const mongoose_1 = require("mongoose");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const auth_constants_1 = require("../auth/auth.constants");
const not_verified_user_model_1 = require("./not-verified-user.model");
const user_model_1 = require("./user.model");
const mongoose_2 = require("mongoose");
const user_referral_service_1 = require("./user-referral/user-referral.service");
const user_cid_history_model_1 = require("./user-cid-history.model");
const store_model_1 = require("../store/store.model");
const user_agreement_model_1 = require("./user-agreement.model");
let UserService = class UserService {
    constructor(userModel, storeModel, notVerifiedUserModel, userCidHistoryModel, userAgreementModel, userReferralService) {
        this.userModel = userModel;
        this.storeModel = storeModel;
        this.notVerifiedUserModel = notVerifiedUserModel;
        this.userCidHistoryModel = userCidHistoryModel;
        this.userAgreementModel = userAgreementModel;
        this.userReferralService = userReferralService;
    }
    async launchCrons() {
    }
    async getTodayUsers() {
        return await this.userModel.find({
            createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
            },
        });
    }
    async getExpressAnalyticsRequestCount(userId) {
        if (!(0, mongoose_2.isValidObjectId)(userId)) {
            return 0;
        }
        const user = await this.userModel.findOne({ _id: userId }).select({ expressAnalyticsRequestCount: 1 });
        return (user === null || user === void 0 ? void 0 : user.expressAnalyticsRequestCount) || 0;
    }
    async decreaseExpressAnalyticsRequestCount(userId) {
        if (!(0, mongoose_2.isValidObjectId)(userId)) {
            return 0;
        }
        const user = await this.userModel.findOne({ _id: userId }).select({ expressAnalyticsRequestCount: 1 });
        await this.userModel.updateOne({
            _id: user._id,
        }, {
            expressAnalyticsRequestCount: user.expressAnalyticsRequestCount - 1,
        });
    }
    async getNotVerifiedUser(phone) {
        return await this.notVerifiedUserModel
            .findOne({
            phone,
        })
            .sort({
            _id: -1,
        });
    }
    async saveNotVerifiedUserModel(dto) {
        const newUser = await new this.notVerifiedUserModel({
            phone: dto.email,
            name: dto.name,
            surname: dto.surname,
            token: this.getRandomToken(100),
        }).save();
        return newUser;
    }
    getRandomToken(length = 50) {
        var a = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('');
        var b = [];
        for (var i = 0; i < length; i++) {
            var j = (Math.random() * (a.length - 1)).toFixed(0);
            b[i] = a[j];
        }
        return b.join('');
    }
    async getNotVerifiedUserByToken(token) {
        return await this.notVerifiedUserModel.findOne({ token });
    }
    async getAllUsers() {
        return await this.userModel.find({});
    }
    async getAllTodayUsers() {
        return await this.userModel.find({
            createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
            },
        });
    }
    async clearNotAllowerUsersByPhone(phone) {
        await this.notVerifiedUserModel.deleteMany({ phone });
    }
    async setPassword(phone, password, invalidateOldTokens = true) {
        const user = await this.userModel.findOne({ email: phone });
        if (!user) {
            throw new common_1.NotFoundException();
        }
        const salt = await (0, bcryptjs_1.genSalt)(10);
        const updateData = {
            passwordHash: await (0, bcryptjs_1.hash)(password, salt),
        };
        if (invalidateOldTokens) {
            updateData.acceptTokensAfterDate = new Date();
        }
        await this.userModel.updateOne({
            _id: user._id,
        }, updateData);
        return {
            _id: user._id,
        };
    }
    async deleteUser(userId) {
        await this.userModel.deleteOne({ _id: userId });
        return {
            userId,
        };
    }
    async findUserByEmail(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async createUser(dto, leadId = 0, contactId = 0, facebook) {
        const oldUser = await this.userModel.findOne({ email: dto.email });
        if (oldUser) {
            throw new common_1.BadRequestException(auth_constants_1.USER_ALREADY_EXISTS_ERROR);
        }
        let referer = null;
        if (dto.refCode) {
            referer = await this.userReferralService.getUserIdByCode(dto.refCode);
        }
        const newUser = new this.userModel({
            email: dto.email,
            passwordHash: '',
            name: dto.name,
            surname: dto.surname,
            leadId,
            contactId,
            isVerify: true,
            referer,
            acceptTokensAfterDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
            isNew: true,
            showNewFeature: false,
        });
        await newUser.save();
        const { fbp, fbc } = facebook;
        try {
            await this.userReferralService.generateCode(newUser._id.toString());
        }
        catch (e) {
            console.log('[^]' + ' user.sarvice ' + ' | ' + new Date() + ' | ' + '\n' + e);
        }
        delete newUser.passwordHash;
        delete newUser.referer;
        return newUser;
    }
    async updateIsRef(userId, value) {
        await this.userModel.updateOne({
            _id: userId,
        }, {
            isRef: value,
        });
    }
    async updateLeadIds(userId, leadId = 0, contactId = 0) {
        await this.userModel.updateOne({
            _id: userId,
        }, {
            leadId,
            contactId,
        });
    }
    async findUserById(id) {
        return this.userModel.findOne({
            _id: new mongoose_1.Types.ObjectId(id),
        }, {
            createdAt: 1,
            email: 1,
            expireDate: 1,
            invitedBy: 1,
            storeLimit: 1,
            name: 1,
            referralCode: 1,
            surname: 1,
            leadId: 1,
            contactId: 1,
            cookie: 1,
            isShowAnalytics: 1,
            topStoreStatistics: 1,
            acceptTokensAfterDate: 1,
            analyticsManagersCount: 1,
        });
    }
    async getUserStatistics(minusDay = 0) {
        let date = new Date(new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - minusDay)).getTime() -
            6 * 60 * 60 * 1000);
        return {
            total: await this.userModel.count({}),
            todayRegistered: await this.userModel.count({
                createdAt: {
                    $gte: date,
                },
            }),
        };
    }
    async searchUsersByKeyWord(keyword) {
        if (!keyword) {
            return [];
        }
        const query = {
            $or: [
                {
                    email: {
                        $regex: keyword || '',
                        $options: 'i',
                    },
                },
                {
                    name: {
                        $regex: keyword || '',
                        $options: 'i',
                    },
                },
                {
                    surname: {
                        $regex: keyword || '',
                        $options: 'i',
                    },
                },
            ],
        };
        return this.userModel.find(query).lean();
    }
    async testUsed(userId) {
        this.userModel.updateOne({ _id: userId }, { isTestUsed: true });
    }
    async giveNewStore(userId) {
        const user = await this.userModel.findOne({ _id: userId });
        if (user) {
            await this.userModel.updateOne({
                _id: userId,
            }, {
                storeLimit: user.storeLimit + 1,
            });
        }
    }
    async isBlocked(userId) {
        if (!(0, mongoose_2.isValidObjectId)(userId)) {
            throw new common_1.NotFoundException();
        }
        const user = await this.userModel
            .findOne({
            _id: userId,
        })
            .select({
            isBlocked: 1,
        });
        if (!user) {
            throw new common_1.NotFoundException();
        }
        return user.isBlocked;
    }
    async getProfileInfo(userId) {
        if (!(0, mongoose_2.isValidObjectId)(userId)) {
            throw new common_1.UnauthorizedException();
        }
        const profile = await this.userModel.aggregate([
            {
                $match: {
                    _id: new mongoose_1.Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: 'Store',
                    as: 'stores',
                    localField: '_id',
                    foreignField: 'userId',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'PrivilegedStore',
                                as: 'privilege',
                                localField: '_id',
                                foreignField: 'storeId',
                                pipeline: [
                                    {
                                        $match: {
                                            isActive: true,
                                            isBlocked: false,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $match: {
                                privilege: {
                                    $ne: [],
                                },
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: 'Payment',
                    as: 'payments',
                    localField: '_id',
                    foreignField: 'userId',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $gte: ['$newExpireDate', new Date()],
                                        },
                                        {
                                            $eq: ['$type', 'ANALYTICS'],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: 'UserAcceptedAgreement',
                    as: 'agreement',
                    localField: '_id',
                    foreignField: 'userId',
                    pipeline: [
                        {
                            $match: {
                                userAgreementAccepted: true,
                            },
                        },
                        {
                            $limit: 1,
                        },
                    ],
                },
            },
            {
                $set: {
                    isShowAnalytics: {
                        $cond: [
                            {
                                $and: [
                                    {
                                        $eq: ['$isShowAnalytics', false],
                                    },
                                    {
                                        $eq: ['$payments', []],
                                    },
                                ],
                            },
                            false,
                            true,
                        ],
                    },
                    termsAccepted: {
                        $gt: [
                            {
                                $size: '$agreement',
                            },
                            0,
                        ],
                    },
                    termsAcceptedAt: {
                        $first: '$agreement.userAgreementAcceptedAt',
                    },
                },
            },
            {
                $project: {
                    isShowAnalytics: 1,
                    name: 1,
                    surname: 1,
                    phoneNumber: `$email`,
                    isShowMessage: 1,
                    topStoreStatistics: 1,
                    expressAnalyticsRequestCount: 1,
                    isNew: 1,
                    showNewFeature: 1,
                    termsAccepted: 1,
                    termsAcceptedAt: 1,
                },
            },
        ]);
        if (profile.length === 0) {
            throw new common_1.UnauthorizedException();
        }
        return profile[0];
    }
    async getAgreement(userId) {
        if (!(0, mongoose_2.isValidObjectId)(userId)) {
            throw new common_1.UnauthorizedException();
        }
        return this.userAgreementModel.findOne({ userId: new mongoose_1.Types.ObjectId(userId) });
    }
    async acceptUserAgreement(userId, dto, req) {
        var _a, _b, _c, _d, _e;
        console.log(`[USER AGREEMENT] acceptUserAgreement called for userId: ${userId}`);
        console.log(`[USER AGREEMENT] Model instance check:`, {
            modelExists: !!this.userAgreementModel,
            modelName: (_a = this.userAgreementModel) === null || _a === void 0 ? void 0 : _a.modelName,
            collectionName: (_c = (_b = this.userAgreementModel) === null || _b === void 0 ? void 0 : _b.collection) === null || _c === void 0 ? void 0 : _c.name,
        });
        if (!(0, mongoose_2.isValidObjectId)(userId)) {
            console.error(`[USER AGREEMENT] Invalid userId: ${userId}`);
            throw new common_1.UnauthorizedException();
        }
        const existing = await this.userAgreementModel.findOne({ userId: new mongoose_1.Types.ObjectId(userId) });
        if (existing) {
            console.log(`[USER AGREEMENT] Agreement already exists for userId: ${userId}`);
            return existing;
        }
        const ip = this.getClientIp(req);
        const userAgent = dto.userAgent || req.headers['user-agent'] || '';
        console.log(`[USER AGREEMENT] IP extraction debug:`, {
            'x-forwarded-for': req.headers['x-forwarded-for'],
            'x-real-ip': req.headers['x-real-ip'],
            'cf-connecting-ip': req.headers['cf-connecting-ip'],
            'req.ip': req.ip,
            'req.socket.remoteAddress': req.socket.remoteAddress,
            'extracted-ip': ip,
        });
        const userAgreementAcceptedAt = new Date();
        const payload = {
            userId: new mongoose_1.Types.ObjectId(userId),
            userAgreementAccepted: true,
            userAgreementAcceptedAt,
            ip,
            userAgent,
            clientInfo: dto.clientInfo || {},
        };
        console.log(`[USER AGREEMENT] Creating new agreement with payload:`, {
            userId: (_d = payload.userId) === null || _d === void 0 ? void 0 : _d.toString(),
            userAgreementAccepted: payload.userAgreementAccepted,
            userAgreementAcceptedAt: payload.userAgreementAcceptedAt,
            ip: payload.ip,
            userAgent: (_e = payload.userAgent) === null || _e === void 0 ? void 0 : _e.substring(0, 50),
            clientInfo: payload.clientInfo,
        });
        try {
            const agreement = new this.userAgreementModel(payload);
            console.log(`[USER AGREEMENT] Saving agreement to database...`);
            console.log(`[USER AGREEMENT] Collection name: ${this.userAgreementModel.collection.name}`);
            const dbName = this.userAgreementModel.db.name || 'unknown';
            console.log(`[USER AGREEMENT] Database name: ${dbName}`);
            const saved = await agreement.save();
            console.log(`[USER AGREEMENT] Agreement saved successfully:`, {
                _id: saved._id,
                userId: saved.userId,
                userAgreementAccepted: saved.userAgreementAccepted,
                userAgreementAcceptedAt: saved.userAgreementAcceptedAt,
                ip: saved.ip,
                collection: this.userAgreementModel.collection.name,
                database: dbName,
            });
            return saved;
        }
        catch (saveError) {
            console.error(`[USER AGREEMENT] Error saving agreement:`, saveError);
            if (saveError instanceof Error) {
                console.error(`[USER AGREEMENT] Error details:`, {
                    message: saveError.message,
                    name: saveError.name,
                    stack: saveError.stack,
                });
            }
            throw saveError;
        }
    }
    getClientIp(req) {
        var _a;
        const forwardedFor = req.headers['x-forwarded-for'];
        if (forwardedFor) {
            if (Array.isArray(forwardedFor)) {
                const ip = (_a = forwardedFor[0]) === null || _a === void 0 ? void 0 : _a.trim();
                if (ip && ip !== '::1' && !ip.startsWith('::ffff:127.0.0.1')) {
                    return ip;
                }
            }
            else if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
                const ip = forwardedFor.split(',')[0].trim();
                if (ip && ip !== '::1' && !ip.startsWith('::ffff:127.0.0.1')) {
                    return ip;
                }
            }
        }
        const realIp = req.headers['x-real-ip'];
        if (realIp && typeof realIp === 'string') {
            const ip = realIp.trim();
            if (ip && ip !== '::1' && !ip.startsWith('::ffff:127.0.0.1')) {
                return ip;
            }
        }
        const cfConnectingIp = req.headers['cf-connecting-ip'];
        if (cfConnectingIp && typeof cfConnectingIp === 'string') {
            const ip = cfConnectingIp.trim();
            if (ip && ip !== '::1' && !ip.startsWith('::ffff:127.0.0.1')) {
                return ip;
            }
        }
        if (req.ip && req.ip !== '::1' && !req.ip.startsWith('::ffff:127.0.0.1')) {
            return req.ip;
        }
        const socketIp = req.socket.remoteAddress;
        if (socketIp && socketIp !== '::1' && !socketIp.startsWith('::ffff:127.0.0.1')) {
            return socketIp;
        }
        return req.ip || req.socket.remoteAddress || 'unknown';
    }
    async updateProfileInfo(userId, dto) {
        if (!(0, mongoose_2.isValidObjectId)(userId)) {
            return;
        }
        await this.userModel.updateOne({
            _id: userId,
        }, {
            cid: dto.cid,
        });
        const exists = await this.userCidHistoryModel.exists({ userId, cid: dto.cid });
        if (!exists) {
            await new this.userCidHistoryModel({ userId, cid: dto.cid }).save().catch((e) => {
                console.log('[^]' + ' user.sarvice ' + ' | ' + new Date() + ' | ' + '\n' + e);
            });
        }
    }
    async resetAcceptTokensAfterDate(userId) {
        try {
            await this.userModel.updateOne({ _id: userId }, { acceptTokensAfterDate: new Date() });
        }
        catch (e) {
            console.log('[^]' + ' user.sarvice ' + ' | ' + new Date() + ' | ' + '\n' + e);
        }
    }
    async updateUserNewFeatures(userId, dto) {
        try {
            await this.userModel.updateOne({ _id: userId }, { isNew: dto.isNew, showNewFeature: dto.showNewFeature });
        }
        catch (e) {
            console.log('[^]' + ' user.sarvice ' + ' | ' + new Date() + ' | ' + '\n' + e);
        }
    }
    async isHavePayments(phoneNumber) {
        try {
            const user = await this.userModel.findOne({ email: `+${phoneNumber}` });
            if (!user) {
                return false;
            }
            const stores = await this.storeModel.findOne({
                userId: user._id,
                expireDate: {
                    $gt: new Date()
                }
            });
            if (stores) {
                return true;
            }
            return false;
        }
        catch (e) {
        }
    }
};
UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_typegoose_1.InjectModel)(user_model_1.UserModel)),
    __param(1, (0, nestjs_typegoose_1.InjectModel)(store_model_1.StoreModel)),
    __param(2, (0, nestjs_typegoose_1.InjectModel)(not_verified_user_model_1.NotVerifiedUserModel)),
    __param(3, (0, nestjs_typegoose_1.InjectModel)(user_cid_history_model_1.UserCidHistoryModel)),
    __param(4, (0, nestjs_typegoose_1.InjectModel)(user_agreement_model_1.UserAgreementModel)),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, user_referral_service_1.UserReferralService])
], UserService);
exports.UserService = UserService;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=user.service.js.map