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
exports.KaspiService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const https_proxy_agent_1 = require("https-proxy-agent");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const proxy_service_1 = require("../proxy/proxy.service");
const url_1 = require("url");
const kaspi_cookie_dto_1 = require("./dto/kaspi-cookie.dto");
const kaspi_settings_dto_1 = require("./dto/kaspi-settings.dto");
const store_constants_1 = require("./store.constants");
const store_model_1 = require("./store.model");
const kaspi_store_pickup_point_model_1 = require("./kaspi-store-pickup-point.model");
const UserAgent = require('user-agents');
const token = process.env.MARKETPLACE_AUTH_TOKEN || '';
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'https://apiauth.salescout.me';
let KaspiService = class KaspiService {
    constructor(proxyService, storeModel, kaspiStorePickupPointModel) {
        this.proxyService = proxyService;
        this.storeModel = storeModel;
        this.kaspiStorePickupPointModel = kaspiStorePickupPointModel;
    }
    async authToKaspi(login, password) {
        console.log("auto to kaspi", login, password);
        const kaspiCookie = new kaspi_cookie_dto_1.KaspiCookieDto();
        kaspiCookie.isAuthorized = false;
        let isError = false;
        for (let attempt = 0; attempt < 3; attempt++) {
            if (kaspiCookie.isAuthorized) {
                break;
            }
            const proxy = await this.proxyService.getRandomModem();
            const search = new URLSearchParams();
            search.append('email', login);
            search.append('password', password);
            search.append('host', proxy.host + ':' + proxy.port);
            search.append('token', token);
            search.append('proxyLogin', proxy.login);
            search.append('proxyPassword', proxy.password);
            const url = `${AUTH_SERVICE_URL}/api/auth/kaspi/?${search.toString()}`;
            try {
                const data = await axios_1.default.get(url);
                if (data.data.cookie) {
                    console.log(data.data);
                    isError = false;
                    kaspiCookie.isAuthorized = true;
                    kaspiCookie.userAgent = data.data.user_agent;
                    kaspiCookie.cookie = data.data.cookie;
                    kaspiCookie.storeId = data.data.storeId;
                    return kaspiCookie;
                }
                else if (!data) {
                    console.log(`BAD CREDENTIALS | ${login} | ${new Date()}`);
                }
            }
            catch (err) {
                isError = true;
                console.log('[^]' + ' kaspi.sarvice ' + ' | ' + new Date() + ' | ' + '\n' + err);
            }
        }
        if (isError) {
            throw new common_1.BadRequestException();
        }
        return kaspiCookie;
    }
    async getStoreData(cookie, userAgent = '', storeId = null) {
        const kaspiSettings = new kaspi_settings_dto_1.KaspiSettingsDto();
        kaspiSettings.isAuthorized = false;
        kaspiSettings.isError = false;
        let isFound = false;
        for (let attempt = 0; attempt < 3 && !isFound; attempt++) {
            const proxy = await this.proxyService.getRandomModem();
            const proxyOpts = (0, url_1.parse)(proxy.proxy);
            proxyOpts.auth = `${proxy.login}:${proxy.password}`;
            const agent = new https_proxy_agent_1.HttpsProxyAgent(proxyOpts);
            const url = `https://mc.shop.kaspi.kz/mc/facade/graphql?opName=getMerchant`;
            const body = {
                "operationName": 'getMerchant',
                "query": "query getMerchant($id: String!) {\n  merchant(id: $id) {\n    id\n    name\n    logo {\n      url\n      __typename\n    }\n    schedule {\n      weekdays {\n        closingTime\n        dayOfWeek\n        openingTime\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  session {\n    merchants(id: $id) {\n      userName\n      name\n      master\n      __typename\n    }\n    __typename\n  }\n}\n",
                "variables": {
                    "id": storeId
                }
            };
            const headers = {
                'cookie': cookie,
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            };
            await axios_1.default
                .post(url, body, {
                headers: headers,
                httpsAgent: agent,
                timeout: 5000,
            })
                .then((data) => {
                var _a;
                console.log('databek', data.data.data);
                if (!((_a = data === null || data === void 0 ? void 0 : data.data) === null || _a === void 0 ? void 0 : _a.data.merchant.name)) {
                    return;
                }
                isFound = true;
                kaspiSettings.cookie = cookie;
                kaspiSettings.logo = data.data.data.merchant.logo.url;
                kaspiSettings.name = data.data.data.merchant.name;
                kaspiSettings.url = `https://kaspi.kz/shop/info/merchant/${storeId}/address-tab/`;
                kaspiSettings.isAuthorized = true;
                kaspiSettings.storeId = data.data.data.merchant.id;
                return kaspiSettings;
            })
                .catch((err) => {
                var _a;
                kaspiSettings.isError = true;
                console.log((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.message, err === null || err === void 0 ? void 0 : err.message, url, new Date());
                console.log('[^]' + ' kaspi.sarvice ' + ' | ' + new Date() + ' | ' + '\n' + err);
            });
        }
        return kaspiSettings;
    }
    async getSettings(login, password, storeId = null) {
        const kaspiCookie = await this.authToKaspi(login, password);
        if (!kaspiCookie.isAuthorized) {
            throw new common_1.BadRequestException(store_constants_1.KASPI_BAD_CREDENTIALS_ERROR);
        }
        if (kaspiCookie.isAuthorized) {
            return await this.getStoreData(kaspiCookie.cookie, kaspiCookie.userAgent, kaspiCookie.storeId);
        }
        const kaspiSettings = new kaspi_settings_dto_1.KaspiSettingsDto();
        kaspiSettings.isAuthorized = false;
        return kaspiSettings;
    }
    async checkKaspiCredentials(login, password) {
        const kaspiSettings = await this.getSettings(login, password);
        return kaspiSettings;
    }
    async getHeaders(cookie, referer = '') {
        const firstUserAgent = new UserAgent();
        const userAgent = firstUserAgent.random().toString();
        return {
            'User-agent': userAgent,
            'Cookie': cookie,
            'Accept-Language': 'ru-RU,ru;q=0.9,en-GB;q=0.8,en;q=0.7,ru-KZ;q=0.6,en-US;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': 'application/json',
            'Referer': referer,
        };
    }
    async loadLastMonthOrdersFromKaspi(apiToken) {
        const pageNumber = 0;
        const pageSize = 10;
        const creationDateGE = new Date().getTime() - 1000 * 60;
        const link = `https://kaspi.kz/shop/api/v2/orders?page[number]=${pageNumber}&page[size]=${pageSize}&filter[orders][state]=NEW&filter[orders][creationDate][$ge]=${creationDateGE}`;
        const proxy = await this.proxyService.getRandomProxy();
        const proxyOpts = (0, url_1.parse)(proxy.proxy);
        proxyOpts.auth = `${proxy.login}:${proxy.password}`;
        const agent = new https_proxy_agent_1.HttpsProxyAgent(proxyOpts);
        const result = await axios_1.default
            .get(link, {
            headers: this.getHeader(apiToken),
            httpsAgent: agent,
            timeout: 15000,
        })
            .then(() => {
            return {
                isValidToken: true,
            };
        })
            .catch((err) => {
            var _a, _b, _c;
            if ((_c = (_b = (_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.includes('authentication is required to access')) {
                return {
                    isValidToken: false,
                };
            }
        });
        if (!(result === null || result === void 0 ? void 0 : result.isValidToken)) {
            throw new common_1.BadRequestException('Неправильный токен');
        }
        return (result === null || result === void 0 ? void 0 : result.isValidToken) || false;
    }
    getHeader(apiToken) {
        return {
            'X-Auth-Token': apiToken,
            'Content-Type': 'application/json',
        };
    }
    async checkApiToken(cookie, storeId) {
        try {
            let apiToken = await this.getApiToken(cookie);
            if (!apiToken) {
                apiToken = await this.postApiToken(cookie);
            }
            if (apiToken) {
                await this.storeModel.updateOne({ _id: storeId }, { apiToken });
            }
        }
        catch (e) {
            console.log('[^]' + ' kaspi.sarvice ' + ' | ' + new Date() + ' | ' + '\n' + e);
        }
    }
    async postApiToken(cookie) {
        let token = '';
        await axios_1.default
            .post('https://kaspi.kz/merchantcabinet/api/merchant/apiAuthToken', {}, {
            headers: this.proxyService.getHeaders(cookie),
        })
            .then((data) => {
            if (data.data) {
                token = data.data;
            }
        })
            .catch((err) => {
            console.log('[^]' + ' kaspi.sarvice ' + ' | ' + new Date() + ' | ' + '\n' + err);
            token = '';
        });
        return token;
    }
    async getApiToken(cookie) {
        let token = '';
        await axios_1.default
            .get('https://kaspi.kz/merchantcabinet/api/merchant/apiAuthToken', {
            headers: this.proxyService.getHeaders(cookie),
        })
            .then((data) => {
            if (data.data) {
                token = data.data;
            }
        })
            .catch((err) => {
            console.log('[^]' + ' kaspi.sarvice ' + ' | ' + new Date() + ' | ' + '\n' + err);
            token = '';
        });
        return token;
    }
    async withdrawProductsFromSale(merchantProductCodes, cookie) {
        const proxy = await this.proxyService.getRandomProxy();
        const proxyOpts = (0, url_1.parse)(proxy.proxy);
        proxyOpts.auth = `${proxy.login}:${proxy.password}`;
        const agent = new https_proxy_agent_1.HttpsProxyAgent(proxyOpts);
        return await axios_1.default
            .post('https://kaspi.kz/merchantcabinet/api/offer/expire', {
            merchantProductCodes,
        }, {
            headers: this.proxyService.getHeaders(cookie),
            httpsAgent: agent,
            timeout: 5000,
        })
            .then((data) => {
            return Object.assign({ isError: false }, data.data);
        })
            .catch((err) => {
            console.log('[^]' + ' kaspi.sarvice ' + ' | ' + new Date() + ' | ' + '\n' + err);
            return {
                isError: true,
            };
        });
    }
    async sendPinCode(phone) {
        var _a;
        let userAgent = '';
        let cookie = '';
        let sessionId = '';
        let statusCode = 200;
        let isError = false;
        const MAX_ATTEMPTS = 3;
        const RETRY_DELAY = 200;
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            if (attempt > 1) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
            const proxy = await this.proxyService.getRandomModem();
            const search = new URLSearchParams();
            search.append('phone', phone);
            search.append('host', proxy.host + ':' + proxy.port);
            search.append('token', token);
            search.append('proxyLogin', proxy.login);
            search.append('proxyPassword', proxy.password);
            const url = `${AUTH_SERVICE_URL}/api/auth/kaspi/phone/?${search.toString()}`;
            try {
                const response = await axios_1.default.get(url, {
                    timeout: 10000,
                });
                if (response.status === 200) {
                    const data = response;
                    const isSuccess = data.data.is_send === true && data.data.is_error !== true && (data.data.status === 200 || !data.data.status);
                    if (isSuccess) {
                        cookie = data.data.cookie || '';
                        statusCode = data.data.status || 200;
                        isError = false;
                        userAgent = data.data.user_agent || '';
                        sessionId = data.data.sessionId || '';
                        break;
                    }
                    else {
                        isError = true;
                        statusCode = data.data.status || 500;
                        if (statusCode === 400 || statusCode === 401 || statusCode === 403) {
                            break;
                        }
                    }
                }
                else if (response.status >= 400 && response.status < 500) {
                    isError = true;
                    statusCode = response.status;
                    break;
                }
            }
            catch (err) {
                isError = true;
                if (err.code === 'ECONNABORTED' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
                    if (attempt === MAX_ATTEMPTS) {
                        statusCode = 500;
                    }
                    continue;
                }
                statusCode = ((_a = err.response) === null || _a === void 0 ? void 0 : _a.status) || 500;
                if (statusCode >= 400 && statusCode < 500) {
                    break;
                }
            }
        }
        return {
            statusCode,
            userAgent,
            cookie,
            isError,
            sessionId,
        };
    }
    async verifyStorePhone(pin, c, ua, sessionId) {
        var _a, _b, _c, _d, _e, _f;
        let cookie = '';
        let statusCode = 200;
        let isError = false;
        let storeId = '';
        let userAgent = ua;
        let email = undefined;
        let password = undefined;
        const MAX_ATTEMPTS = 5;
        const RETRY_DELAY = 200;
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            if (attempt > 0) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
            const proxy = await this.proxyService.getRandomModem();
            const search = new URLSearchParams();
            search.append('host', proxy.host + ':' + proxy.port);
            search.append('token', token);
            search.append('proxyLogin', proxy.login);
            search.append('proxyPassword', proxy.password);
            const body = {
                code: pin,
                cookie: c,
                userAgent: ua,
            };
            if (sessionId) {
                body.sessionId = sessionId;
            }
            const url = `${AUTH_SERVICE_URL}/api/auth/kaspi/phone/verify/?${search.toString()}`;
            try {
                const data = await axios_1.default.post(url, body, {
                    timeout: 5000,
                });
                if (((_a = data.data) === null || _a === void 0 ? void 0 : _a.statusCode) === 200 && ((_b = data.data) === null || _b === void 0 ? void 0 : _b.isError) === false) {
                    cookie = data.data.cookie || '';
                    statusCode = 200;
                    isError = false;
                    storeId = data.data.storeId || '';
                    userAgent = data.data.user_agent || data.data.userAgent || ua;
                    email = data.data.email || undefined;
                    password = data.data.password || undefined;
                    break;
                }
                else {
                    statusCode = ((_c = data.data) === null || _c === void 0 ? void 0 : _c.statusCode) || 500;
                    isError = true;
                    if (statusCode === 400 || statusCode === 401 || statusCode === 403) {
                        break;
                    }
                }
            }
            catch (err) {
                isError = true;
                statusCode = ((_d = err.response) === null || _d === void 0 ? void 0 : _d.status) || 500;
                if (((_e = err.response) === null || _e === void 0 ? void 0 : _e.status) === 200 && ((_f = err.response) === null || _f === void 0 ? void 0 : _f.data)) {
                    const responseData = err.response.data;
                    if (responseData.statusCode === 200 && responseData.isError === false) {
                        cookie = responseData.cookie || '';
                        statusCode = 200;
                        isError = false;
                        storeId = responseData.storeId || '';
                        userAgent = responseData.user_agent || responseData.userAgent || ua;
                        email = responseData.email || undefined;
                        password = responseData.password || undefined;
                        break;
                    }
                }
                if (statusCode === 400 || statusCode === 401 || statusCode === 403) {
                    break;
                }
                if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND' || err.code === 'ECONNABORTED') {
                    if (attempt === MAX_ATTEMPTS - 1) {
                        statusCode = 500;
                        break;
                    }
                    else {
                        continue;
                    }
                }
                if (attempt === MAX_ATTEMPTS - 1) {
                    break;
                }
            }
        }
        return {
            statusCode,
            cookie,
            isError,
            storeId,
            userAgent,
            email,
            password,
        };
    }
    async createKaspiUser(dto) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        console.log(`[KASPI_SERVICE] 🚀 createKaspiUser вызван`);
        console.log(`[KASPI_SERVICE]    StoreId: ${dto.storeId}`);
        console.log(`[KASPI_SERVICE]    KaspiStoreId: ${dto.kaspiStoreId}`);
        console.log(`[KASPI_SERVICE]    Cookie length: ${((_a = dto.cookie) === null || _a === void 0 ? void 0 : _a.length) || 0}`);
        console.log(`[KASPI_SERVICE]    UserAgent: ${dto.userAgent ? dto.userAgent.substring(0, 50) + '...' : 'нет'}`);
        console.log(`[KASPI_SERVICE]    AUTH_SERVICE_URL: ${AUTH_SERVICE_URL}`);
        console.log(`[KASPI_SERVICE]    MARKETPLACE_AUTH_TOKEN: ${token ? 'есть' : 'отсутствует'}`);
        try {
            console.log(`[KASPI_SERVICE] 🔍 Проверяем доступность Auth-API: ${AUTH_SERVICE_URL}/api/`);
            try {
                await axios_1.default.get(`${AUTH_SERVICE_URL}/api/`, { timeout: 3000 }).catch(() => null);
                console.log(`[KASPI_SERVICE] ✅ Auth-API доступен`);
            }
            catch (error) {
                console.warn(`[KASPI_SERVICE] ⚠️  Health check не прошел, но продолжаем: ${error.message}`);
            }
            console.log(`[KASPI_SERVICE] 🔍 Получаем proxy...`);
            let proxy;
            try {
                proxy = await this.proxyService.getRandomModem();
                if (!proxy) {
                    console.error(`[KASPI_SERVICE] ❌ getRandomModem вернул null`);
                    return {
                        success: false,
                        error: 'Proxy not available (null)',
                    };
                }
                console.log(`[KASPI_SERVICE] ✅ Proxy получен: ${proxy.host}:${proxy.port}`);
            }
            catch (proxyError) {
                console.error(`[KASPI_SERVICE] ❌ Ошибка получения proxy:`, proxyError.message);
                console.error(`[KASPI_SERVICE]    Stack:`, (_b = proxyError.stack) === null || _b === void 0 ? void 0 : _b.substring(0, 200));
                return {
                    success: false,
                    error: `Proxy error: ${proxyError.message}`,
                };
            }
            const search = new URLSearchParams();
            search.append('host', proxy.host + ':' + proxy.port);
            search.append('token', token);
            search.append('proxyLogin', proxy.login);
            search.append('proxyPassword', proxy.password);
            const url = `${AUTH_SERVICE_URL}/api/kaspi-user/create?${search.toString()}`;
            const pleskCookie = process.env.PLESK_COOKIE;
            console.log(`[KASPI_SERVICE] 📤 Отправляем запрос на создание пользователя: ${url}`);
            console.log(`[KASPI_SERVICE]    Body: storeId=${dto.storeId}, kaspiStoreId=${dto.kaspiStoreId}, cookie length=${((_c = dto.cookie) === null || _c === void 0 ? void 0 : _c.length) || 0}`);
            const response = await axios_1.default.post(url, {
                storeId: dto.storeId,
                kaspiStoreId: dto.kaspiStoreId,
                cookie: dto.cookie,
                userAgent: dto.userAgent,
                pleskCookie: pleskCookie,
            }, {
                timeout: 60000,
            });
            console.log(`[KASPI_SERVICE] 📥 Ответ от auth-api: status=${response.status}, success=${(_d = response.data) === null || _d === void 0 ? void 0 : _d.success}`);
            if ((_e = response.data) === null || _e === void 0 ? void 0 : _e.success) {
                console.log(`[KASPI_SERVICE] ✅ Пользователь успешно создан: ${(_f = response.data) === null || _f === void 0 ? void 0 : _f.email}`);
                return {
                    success: true,
                    email: (_g = response.data) === null || _g === void 0 ? void 0 : _g.email,
                    password: (_h = response.data) === null || _h === void 0 ? void 0 : _h.password,
                };
            }
            else {
                console.error(`[KASPI_SERVICE] ❌ Ошибка создания пользователя: ${((_j = response.data) === null || _j === void 0 ? void 0 : _j.error) || 'Unknown error'}`);
                console.error(`[KASPI_SERVICE]    Status: ${((_k = response.data) === null || _k === void 0 ? void 0 : _k.status) || 'не указан'}`);
                return {
                    success: false,
                    error: ((_l = response.data) === null || _l === void 0 ? void 0 : _l.error) || 'Unknown error',
                };
            }
        }
        catch (error) {
            console.error(`[KASPI_SERVICE] ❌ Исключение при создании пользователя:`, error.message);
            if (error.response) {
                console.error(`[KASPI_SERVICE]    Response status: ${error.response.status}`);
                console.error(`[KASPI_SERVICE]    Response data:`, JSON.stringify(error.response.data || {}).substring(0, 500));
            }
            if (error.code) {
                console.error(`[KASPI_SERVICE]    Error code: ${error.code}`);
            }
            return {
                success: false,
                error: error.message || 'Failed to create Kaspi user',
            };
        }
    }
};
KaspiService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, nestjs_typegoose_1.InjectModel)(store_model_1.StoreModel)),
    __param(2, (0, nestjs_typegoose_1.InjectModel)(kaspi_store_pickup_point_model_1.KaspiStorePickupPointModel)),
    __metadata("design:paramtypes", [proxy_service_1.ProxyService, Object, Object])
], KaspiService);
exports.KaspiService = KaspiService;
//# sourceMappingURL=kaspi.service.js.map