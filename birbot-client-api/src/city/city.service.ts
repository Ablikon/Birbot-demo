import { Injectable } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import axios from 'axios'
import { InjectModel } from 'nestjs-typegoose'
import { MarketplaceCityModel } from './marketplace-city.model'
import { CronJob } from 'cron'
@Injectable()
export class CityService {
    constructor(@InjectModel(MarketplaceCityModel) private readonly marketplaceCityModel: ModelType<MarketplaceCityModel>) {
        this.scheduleTask()
        // this.loadKaspiCities()
    }
    private scheduleTask() {
        console.log('start sinchronization')
        new CronJob(
            '0 0 1 * *',
            async () => {
                await this.syncCitiesFromKaspi()
                console.log('Города синхронизированы')
            },
            null,
            true
        )
    }
    public async authenticateAndGetCities() {
        const url = 'https://kaspi.kz/merchantcabinet/api/merchant/allCities/'
        const cookies =
            'ks.ngs.m=44ad37db1a147674ef1fae0a521f3160; expires=Tue, 29-Apr-25 06:11:01 GMT; max-age=900; domain=.kaspi.kz; path=/; X-Mc-Api-Session-Id=Y12-74407b06-e1bf-4df8-bf54-eb3fb4bfc060; Domain=kaspi.kz; Path=/; Secure; HttpOnly; '
        try {
            const response = await axios.get(url, { headers: { Cookie: cookies } })
            // console.log("res", response)
            if (response.data && Array.isArray(response.data)) {
                console.log('connected')
                return response.data.map((city: any) => ({
                    id: city.id,
                    name: city.name,
                }))
            }
        } catch (error) {
            console.log('[^]'+' city.service '+' | '+ new Date() +' | '+'\n'+error)
            return []
        }
    }
    public async syncCitiesFromKaspi(): Promise<void> {
        console.log('Начало синхронизации городов из Kaspi')
        const cities = await this.authenticateAndGetCities()
        if (!cities) {
            console.log('Проблема при получении данных о городах. Получен undefined.')
            return
        }
        console.log(`Найдено городов: ${cities.length}`)
        if (cities.length > 0) {
            for (const city of cities) {
                console.log(`Обновление города: ${city.name}`)
                await this.marketplaceCityModel
                    .findOneAndUpdate({ marketplaceKey: 'KASPI', id: city.id }, { name: city.name }, { upsert: true })
                    .catch((error) =>             console.log('[^]'+' city.service '+' | '+ new Date() +' | '+'\n'+error))
            }
            console.log('Города синхронизированы в базе данных.')
        } else {
            console.log('Нет городов для синхронизации.')
        }
    }

    public async getCities(marketplaceKey: string) {
        await this.syncCitiesFromKaspi()
        console.log('Города синхронизированы')
        const cities = await this.marketplaceCityModel.find({ marketplaceKey }).sort({ name: 1 })

        return cities.map((data) => {
            return {
                id: data.id,
                name: data.name,
            }
        })
    }

    public async getCity(marketplaceKey: string, id: string) {
        return this.marketplaceCityModel.findOne({ marketplaceKey, id })
    }

    public async loadJmartCities() {
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
        ]

        for (const city of jmartCities) {
            await new this.marketplaceCityModel({
                marketplaceKey: 'JMART',
                name: city.city,
                id: city.city_id.toString(),
            }).save()
        }
    }

    public async loadHalykmarketCities() {
        const response = await axios.get('https://halykmarket.kz/api/public/v1/city/all')

        const cities = response.data

        for (const city of cities) {
            await new this.marketplaceCityModel({
                marketplaceKey: 'HALYKMARKET',
                id: city.code,
                name: city.friendlyName,
            })
                .save()
                .catch(() => {})

            await this.marketplaceCityModel.updateOne(
                {
                    marketplaceKey: 'HALYKMARKET',
                    id: city.code,
                },
                { name: city.friendlyName }
            )
        }
    }
}
