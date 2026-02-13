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
exports.KaspiAPIService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const axios_1 = require("axios");
const kaspi_api_model_1 = require("./kaspi-api.model");
const mongoose_1 = require("mongoose");
const certificateType = `LETOSTORE`;
let KaspiAPIService = class KaspiAPIService {
    constructor(kaspiAPIPaymentModel) {
        this.kaspiAPIPaymentModel = kaspiAPIPaymentModel;
    }
    async getPaymentStatus(paymentId, userId) {
        try {
            const response = await axios_1.default.get(`http://5.35.104.248:7777/api/kaspi-api/status/${certificateType}/${paymentId}`, {
                headers: {
                    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJ2YWxpZGF0aW9uVG9rZW5TYWxlc2NvdXQxMjMiLCJpYXQiOjE3MjI2MDY4MTV9.NcOhDEGEXSUMkgkQ8t2xy75NL5qtYD34Z5F5u9SA_zY"
                }
            });
            if (response.status === 200) {
                const responseData = response.data;
                if (responseData.StatusCode === 0) {
                    const currentPayment = await this.kaspiAPIPaymentModel.findOne({ paymentId });
                    if (currentPayment && currentPayment.status !== responseData.Data.Status) {
                        await this.kaspiAPIPaymentModel.findOneAndUpdate({ paymentId }, {
                            status: responseData.Data.Status,
                            loanTerm: responseData.Data.LoanTerm,
                            isOffer: responseData.Data.IsOffer,
                        }, { new: true });
                    }
                    return { error: false, status: responseData.Data.Status };
                }
                else if (responseData.StatusCode === -1601) {
                    throw new common_1.HttpException({
                        error: true,
                        statusCode: common_1.HttpStatus.BAD_REQUEST,
                        message: 'Покупка не найдена!',
                    }, common_1.HttpStatus.BAD_REQUEST);
                }
                else {
                    throw new common_1.HttpException({
                        error: true,
                        statusCode: common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                        message: 'Что-то пошло не так...',
                    }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
                }
            }
            else {
                throw new common_1.HttpException({
                    error: true,
                    statusCode: response.status,
                    message: 'Что-то пошло не так...',
                }, response.status);
            }
        }
        catch (error) {
            throw new common_1.HttpException({
                error: true,
                statusCode: error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR,
                message: error.message || 'Что-то пошло не так...',
            }, error.status || common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async createQrToken({ amount, externalId, merchantId, userId }) {
        try {
            const response = await axios_1.default.post('http://5.35.104.248:7777/api/kaspi-api/token', {
                "organizationBin": "210140006322",
                "deviceToken": "af19183c-8e2b-4ccb-b247-94972a3b6452",
                "transactionId": externalId,
                "amount": amount,
                "certificateType": certificateType
            }, {
                headers: {
                    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJ2YWxpZGF0aW9uVG9rZW5TYWxlc2NvdXQxMjMiLCJpYXQiOjE3MjI2MDY4MTV9.NcOhDEGEXSUMkgkQ8t2xy75NL5qtYD34Z5F5u9SA_zY"
                }
            });
            if ((response.status == 200 || response.status == 201) && response.data.StatusCode == 0) {
                await new this.kaspiAPIPaymentModel({
                    authorId: new mongoose_1.Types.ObjectId(userId),
                    merchantId,
                    transactionId: externalId,
                    amount,
                    paymentId: response.data.Data.QrPaymentId,
                    paymentLink: response.data.Data.PaymentLink,
                    paymentMethods: response.data.Data.PaymentMethods,
                    paymentBehaviorOptions: {
                        qrCodeScanWaitTimeout: response.data.Data.QrPaymentBehaviorOptions.QrCodeScanWaitTimeout,
                        paymentConfirmationTimeout: response.data.Data.QrPaymentBehaviorOptions.PaymentConfirmationTimeout,
                        statusPollingInterval: response.data.Data.QrPaymentBehaviorOptions.StatusPollingInterval
                    },
                    expireDate: response.data.Data.ExpireDate,
                    status: "QrTokenCreated"
                }).save()
                    .catch((e) => {
                    console.log('[^]' + ' kaspi-api.service ' + ' | ' + new Date() + ' | ' + '\n' + e);
                });
                return {
                    qrToken: response.data.Data.QrToken,
                    paymentId: response.data.Data.QrPaymentId,
                    paymentTypes: response.data.Data.PaymentMethods,
                    status: 'QrTokenCreated',
                    externalId,
                    paymentBehaviorOptions: {
                        qrCodeScanWaitTimeout: response.data.Data.QrPaymentBehaviorOptions.QrCodeScanWaitTimeout,
                        paymentConfirmationTimeout: response.data.Data.QrPaymentBehaviorOptions.PaymentConfirmationTimeout,
                        statusPollingInterval: response.data.Data.QrPaymentBehaviorOptions.StatusPollingInterval
                    }
                };
            }
            return {
                message: 'Не получилось создать Kaspi QR',
                status: response.status,
                data: response.data
            };
        }
        catch (error) {
            console.error('[!]' + ' kaspi-api.service ' + ' | ' + 'Error creating QR token' + ' | ' + +new Date() + ' | ' + '\n' + error);
            if (axios_1.default.isAxiosError(error) && error.response) {
                throw new common_1.HttpException({ message: error.response.data, statusCode: error.response.status, status: "Error" }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            else {
                throw new common_1.HttpException({ message: error.message, statusCode: 500, status: "Error" }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    async createQrLink({ amount, externalId, merchantId, userId }) {
        try {
            const response = await axios_1.default.post('http://5.35.104.248:7777/api/kaspi-api/link', {
                "organizationBin": "210140006322",
                "deviceToken": "af19183c-8e2b-4ccb-b247-94972a3b6452",
                "transactionId": externalId,
                "amount": amount,
                "certificateType": certificateType
            }, {
                headers: {
                    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJ2YWxpZGF0aW9uVG9rZW5TYWxlc2NvdXQxMjMiLCJpYXQiOjE3MjI2MDY4MTV9.NcOhDEGEXSUMkgkQ8t2xy75NL5qtYD34Z5F5u9SA_zY"
                }
            });
            if ((response.status == 200 || response.status == 201) && response.data.StatusCode == 0) {
                await new this.kaspiAPIPaymentModel({
                    authorId: new mongoose_1.Types.ObjectId(userId),
                    merchantId,
                    transactionId: externalId,
                    amount,
                    paymentId: response.data.Data.PaymentId,
                    paymentLink: response.data.Data.PaymentLink,
                    paymentMethods: response.data.Data.PaymentMethods,
                    paymentBehaviorOptions: {
                        linkActivationWaitTimeout: response.data.Data.PaymentBehaviorOptions.LinkActivationWaitTimeout,
                        paymentConfirmationTimeout: response.data.Data.PaymentBehaviorOptions.PaymentConfirmationTimeout,
                        statusPollingInterval: response.data.Data.PaymentBehaviorOptions.StatusPollingInterval
                    },
                    expireDate: response.data.Data.ExpireDate,
                    status: "QrTokenCreated"
                }).save()
                    .catch((e) => {
                    console.log('[^]' + ' kaspi-api.service ' + ' | ' + new Date() + ' | ' + '\n' + e);
                });
                return {
                    paymentLink: response.data.Data.PaymentLink,
                    paymentId: response.data.Data.PaymentId,
                    paymentTypes: response.data.Data.PaymentMethods,
                    externalId: externalId,
                    status: 'QrTokenCreated',
                    paymentBehaviorOptions: {
                        linkActivationWaitTimeout: response.data.Data.PaymentBehaviorOptions.LinkActivationWaitTimeout,
                        paymentConfirmationTimeout: response.data.Data.PaymentBehaviorOptions.PaymentConfirmationTimeout,
                        statusPollingInterval: response.data.Data.PaymentBehaviorOptions.StatusPollingInterval
                    }
                };
            }
            return {
                message: 'Не получилось создать Kaspi ссылку',
                status: response.status,
                data: response.data
            };
        }
        catch (error) {
            console.error('[!]' + ' kaspi-api.service ' + ' | ' + 'Error creating QR token' + ' | ' + +new Date() + ' | ' + '\n' + error);
            if (axios_1.default.isAxiosError(error) && error.response) {
                throw new common_1.HttpException({ message: error.response.data, statusCode: error.response.status, status: "Error" }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            else {
                throw new common_1.HttpException({ message: error.message, statusCode: 500, status: "Error" }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    async refundPurchase({ paymentId, amount, merchantId, userId }) {
        var _a, _b, _c, _d, _e;
        try {
            const response = await axios_1.default.post('http://5.35.104.248:7777/api/kaspi-api/refund', {
                "organizationBin": "210140006322",
                "deviceToken": "af19183c-8e2b-4ccb-b247-94972a3b6452",
                "paymentId": paymentId,
                "amount": amount,
                "certificateType": certificateType
            }, {
                headers: {
                    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJ2YWxpZGF0aW9uVG9rZW5TYWxlc2NvdXQxMjMiLCJpYXQiOjE3MjI2MDY4MTV9.NcOhDEGEXSUMkgkQ8t2xy75NL5qtYD34Z5F5u9SA_zY"
                }
            });
            if ((response.status == 200 || response.status == 201) && response.data.StatusCode == 0) {
                const payment = await this.kaspiAPIPaymentModel.findOne({ paymentId });
                if (payment) {
                    await this.kaspiAPIPaymentModel.updateOne({
                        paymentId: paymentId
                    }, {
                        $set: {
                            refundAmount: amount + (payment.refundAmount || 0),
                            status: "Refunded"
                        }
                    }).catch((e) => {
                        console.log('[^]' + ' kaspi-api.service ' + ' | ' + new Date() + ' | ' + '\n' + e);
                    });
                }
                if (((_a = response.data) === null || _a === void 0 ? void 0 : _a.StatusCode) === 0) {
                    return {
                        statusCode: 0,
                        returnOperationId: response.data.Data.ReturnOperationId,
                        status: 'Refunded',
                    };
                }
                else {
                    throw new common_1.HttpException({
                        status: "Error",
                        statusCode: ((_b = response.data) === null || _b === void 0 ? void 0 : _b.StatusCode) || 400,
                        message: ((_c = response.data) === null || _c === void 0 ? void 0 : _c.Message) || "Не удалось оформить возврат"
                    }, common_1.HttpStatus.BAD_REQUEST);
                }
            }
            throw new common_1.HttpException({
                message: ((_d = response.data) === null || _d === void 0 ? void 0 : _d.Message) || response.data || "Произошла ошибка при оформлении возврата",
                statusCode: ((_e = response.data) === null || _e === void 0 ? void 0 : _e.StatusCode) || response.status,
                status: "Error"
            }, response.status);
        }
        catch (error) {
            console.error('[!]' + ' kaspi-api.service ' + ' | ' + 'Error refunding purchase' + ' | ' + +new Date() + ' | ' + '\n' + error);
            if (axios_1.default.isAxiosError(error) && error.response) {
                throw new common_1.HttpException({ message: error.response.data, statusCode: error.response.status, status: "Error" }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
            else {
                throw new common_1.HttpException({ message: error.message, statusCode: 500, status: "Error" }, common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
};
KaspiAPIService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_typegoose_1.InjectModel)(kaspi_api_model_1.KaspiAPIPaymentsModel)),
    __metadata("design:paramtypes", [Object])
], KaspiAPIService);
exports.KaspiAPIService = KaspiAPIService;
//# sourceMappingURL=kaspi-api.service.js.map