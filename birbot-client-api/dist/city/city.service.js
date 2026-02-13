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
exports.CityService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const marketplace_city_model_1 = require("./marketplace-city.model");
const cron_1 = require("cron");
let CityService = class CityService {
    constructor(marketplaceCityModel) {
        this.marketplaceCityModel = marketplaceCityModel;
        this.scheduleTask();
    }
    scheduleTask() {
        console.log('start sinchronization');
        new cron_1.CronJob('0 0 1 * *', async () => {
            await this.syncCitiesFromKaspi();
            console.log('Города синхронизированы');
        }, null, true);
    }
    async authenticateAndGetCities() {
        const url = 'https://kaspi.kz/merchantcabinet/api/merchant/allCities/';
        const cookies = 'ks.ngs.m=44ad37db1a147674ef1fae0a521f3160; expires=Tue, 29-Apr-25 06:11:01 GMT; max-age=900; domain=.kaspi.kz; path=/; X-Mc-Api-Session-Id=Y12-74407b06-e1bf-4df8-bf54-eb3fb4bfc060; Domain=kaspi.kz; Path=/; Secure; HttpOnly; ';
        try {
            const response = await axios_1.default.get(url, { headers: { Cookie: cookies } });
            if (response.data && Array.isArray(response.data)) {
                console.log('connected');
                return response.data.map((city) => ({
                    id: city.id,
                    name: city.name,
                }));
            }
        }
        catch (error) {
            console.log('[^]' + ' city.service ' + ' | ' + new Date() + ' | ' + '\n' + error);
            return [];
        }
    }
    async syncCitiesFromKaspi() {
        console.log('Начало синхронизации городов из Kaspi');
        const cities = await this.authenticateAndGetCities();
        if (!cities) {
            console.log('Проблема при получении данных о городах. Получен undefined.');
            return;
        }
        console.log(`Найдено городов: ${cities.length}`);
        if (cities.length > 0) {
            for (const city of cities) {
                console.log(`Обновление города: ${city.name}`);
                await this.marketplaceCityModel
                    .findOneAndUpdate({ marketplaceKey: 'KASPI', id: city.id }, { name: city.name }, { upsert: true })
                    .catch((error) => console.log('[^]' + ' city.service ' + ' | ' + new Date() + ' | ' + '\n' + error));
            }
            console.log('Города синхронизированы в базе данных.');
        }
        else {
            console.log('Нет городов для синхронизации.');
        }
    }
    async getCities(marketplaceKey) {
        await this.syncCitiesFromKaspi();
        console.log('Города синхронизированы');
        const cities = await this.marketplaceCityModel.find({ marketplaceKey }).sort({ name: 1 });
        return cities.map((data) => {
            return {
                id: data.id,
                name: data.name,
            };
        });
    }
    async getCity(marketplaceKey, id) {
        return this.marketplaceCityModel.findOne({ marketplaceKey, id });
    }
    async loadJmartCities() {
        const jmartCities = [
            {
                city: 'Алматы',
                c: '7179',
                city_id: 443,
            },
            {
                city: 'Астана',
                c: '1987',
                city_id: 13698,
            },
            {
                city: 'Шымкент',
                c: '1094',
                city_id: 21989,
            },
            {
                city: 'Караганда',
                c: '583',
                city_id: 7632,
            },
            {
                city: 'Актобе',
                c: '412',
                city_id: 263,
            },
            {
                city: 'Костанай',
                c: '328',
                city_id: 8812,
            },
            {
                city: 'Атырау',
                c: '275',
                city_id: 873,
            },
            {
                city: 'Тараз',
                c: '267',
                city_id: 19081,
            },
            {
                city: 'Актау',
                c: '241',
                city_id: 261,
            },
            {
                city: 'Павлодар',
                c: '235',
                city_id: 14403,
            },
            {
                city: 'Уральск',
                c: '224',
                city_id: 20094,
            },
            {
                city: 'Усть-Каменогорск',
                c: '220',
                city_id: 20245,
            },
            {
                city: 'Кызылорда',
                c: '164',
                city_id: 10001,
            },
            {
                city: 'Петропавловск',
                c: '156',
                city_id: 14869,
            },
            {
                city: 'Семей',
                c: '142',
                city_id: 17292,
            },
            {
                city: 'Кокшетау',
                c: '119',
                city_id: 8367,
            },
            {
                city: 'Талдыкорган',
                c: '114',
                city_id: 19018,
            },
        ];
        for (const city of jmartCities) {
            await new this.marketplaceCityModel({
                marketplaceKey: 'JMART',
                name: city.city,
                id: city.city_id.toString(),
            }).save();
        }
    }
    async loadHalykmarketCities() {
        const response = await axios_1.default.get('https://halykmarket.kz/api/public/v1/city/all');
        const cities = response.data;
        for (const city of cities) {
            await new this.marketplaceCityModel({
                marketplaceKey: 'HALYKMARKET',
                id: city.code,
                name: city.friendlyName,
            })
                .save()
                .catch(() => { });
            await this.marketplaceCityModel.updateOne({
                marketplaceKey: 'HALYKMARKET',
                id: city.code,
            }, { name: city.friendlyName });
        }
    }
};
CityService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_typegoose_1.InjectModel)(marketplace_city_model_1.MarketplaceCityModel)),
    __metadata("design:paramtypes", [Object])
], CityService);
exports.CityService = CityService;
//# sourceMappingURL=city.service.js.map