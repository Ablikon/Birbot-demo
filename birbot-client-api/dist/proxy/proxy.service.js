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
exports.ProxyService = void 0;
const common_1 = require("@nestjs/common");
const https_proxy_agent_1 = require("https-proxy-agent");
const mongoose_1 = require("mongoose");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const url_1 = require("url");
const proxy_constants_1 = require("./proxy.constants");
const proxy_model_1 = require("./proxy.model");
const UserAgent = require('user-agents');
let ProxyService = class ProxyService {
    constructor(proxyModel) {
        this.proxyModel = proxyModel;
    }
    async getRandomProxy(type = 'MERCHANTCABINET') {
        const proxies = await this.proxyModel.find({
            type,
            isActive: true,
        });
        if (proxies.length === 0) {
            throw new common_1.NotFoundException(proxy_constants_1.PROXY_NOT_FOUND_ERROR);
        }
        const randomProxy = proxies[parseInt(Math.random() * proxies.length + '')];
        return randomProxy;
    }
    async getRandomModem() {
        let proxies = await this.proxyModel.find({
            isActive: true,
            phoneName: { $regex: /Модем/ }
        });
        if (proxies.length === 0) {
            proxies = await this.proxyModel.find({
                isActive: true,
            });
        }
        if (proxies.length === 0) {
            throw new common_1.NotFoundException(proxy_constants_1.PROXY_NOT_FOUND_ERROR);
        }
        const randomProxy = proxies[parseInt(Math.random() * proxies.length + '')];
        return randomProxy;
    }
    async getRandomProxyForSales() {
        const proxies = await this.proxyModel.find({
            type: 'MERCHANTCABINET',
            isActive: true,
        });
        if (proxies.length === 0) {
            throw new common_1.NotFoundException(proxy_constants_1.PROXY_NOT_FOUND_ERROR);
        }
        const randomProxy = proxies[parseInt(Math.random() * proxies.length + '')];
        return randomProxy;
    }
    async addProxy(userId, dto) {
        const oldProxy = await this.proxyModel.findOne({
            userId,
            proxy: `http://${dto.host}:${dto.port}`,
        });
        if (oldProxy) {
            throw new common_1.BadRequestException(proxy_constants_1.PROXY_ALREADY_EXISTS_ERROR);
        }
        const newProxy = new this.proxyModel({
            userId: new mongoose_1.Types.ObjectId(userId),
            proxy: `http://${dto.host}:${dto.port}`,
            host: dto.host,
            port: dto.port,
            login: dto.login,
            password: dto.password,
        });
        return await newProxy.save();
    }
    async deleteProxy(proxyId) {
        const oldProxy = await this.proxyModel.findOne({ _id: proxyId });
        if (!oldProxy) {
            throw new common_1.NotFoundException(proxy_constants_1.PROXY_NOT_FOUND_ERROR);
        }
        this.proxyModel.deleteOne({ _id: new mongoose_1.Types.ObjectId(proxyId) }).exec();
    }
    async getActiveProxies() {
        return {
            count: await this.proxyModel.count({
                isActive: true,
            }),
            total: await this.proxyModel.count({}),
        };
    }
    async updateProxy(dto, proxyId) {
        const oldProxy = await this.proxyModel.findOne({ _id: proxyId });
        if (!oldProxy) {
            throw new common_1.NotFoundException(proxy_constants_1.PROXY_NOT_FOUND_ERROR);
        }
        const host = dto.host || oldProxy.host;
        const port = dto.port || oldProxy.port;
        await this.proxyModel.updateOne({ _id: new mongoose_1.Types.ObjectId(proxyId) }, {
            login: dto.login,
            password: dto.password,
            host,
            port,
            proxy: `http://${host}:${port}`,
        });
    }
    async getAllProxies() {
        const result = [];
        const proxies = await this.proxyModel.find({});
        for (const proxy of proxies) {
            result.push({
                _id: proxy._id,
                login: proxy.login,
                password: proxy.password,
                proxy: proxy.proxy,
                host: proxy.host,
                port: proxy.port,
                createdAt: proxy.createdAt,
                updatedAt: proxy.updatedAt,
                usedCount: proxy.usedCount,
                isActive: proxy.isActive,
                type: proxy.type,
            });
        }
        return result;
    }
    getHttpsAgent(proxy) {
        const proxyOpts = (0, url_1.parse)(proxy.proxy);
        proxyOpts.auth = `${proxy.login}:${proxy.password}`;
        const agent = new https_proxy_agent_1.HttpsProxyAgent(proxyOpts);
        return agent;
    }
    getHeaders(cookie = '', userAgent = '') {
        if (!userAgent) {
            userAgent = this.getRandomUserAgent().toString();
        }
        const referer = `https://kaspi.kz/merchantcabinet/`;
        return {
            'Connection': 'close',
            'Cookie': cookie,
            'Host': 'kaspi.kz',
            'Origin': 'https://kaspi.kz',
            'Referer': referer,
            'User-Agent': userAgent,
        };
    }
    getRandomUserAgent() {
        const firstUserAgent = new UserAgent();
        const userAgent = firstUserAgent.random();
        return userAgent;
    }
};
ProxyService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_typegoose_1.InjectModel)(proxy_model_1.ProxyModel)),
    __metadata("design:paramtypes", [Object])
], ProxyService);
exports.ProxyService = ProxyService;
//# sourceMappingURL=proxy.service.js.map