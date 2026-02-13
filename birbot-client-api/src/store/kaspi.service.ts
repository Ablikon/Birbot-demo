import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import axios from 'axios'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { InjectModel } from 'nestjs-typegoose'
import { ProxyService } from 'src/proxy/proxy.service'
import { parse } from 'url'
import { KaspiCookieDto } from './dto/kaspi-cookie.dto'
import { KaspiSettingsDto } from './dto/kaspi-settings.dto'
import { KASPI_BAD_CREDENTIALS_ERROR } from './store.constants'
import { StoreModel } from './store.model'
import { KaspiStorePickupPointModel } from './kaspi-store-pickup-point.model'
import { metrics } from 'src/metrics'
const UserAgent = require('user-agents')

const token = process.env.MARKETPLACE_AUTH_TOKEN || ''
// Для production используем продакшен URL, для локальной разработки можно переопределить через AUTH_SERVICE_URL
const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'https://apiauth.salescout.me'

@Injectable()
export class KaspiService {
    constructor(
        private readonly proxyService: ProxyService,
        @InjectModel(StoreModel) private readonly storeModel: ModelType<StoreModel>,
        @InjectModel(KaspiStorePickupPointModel)
        private readonly kaspiStorePickupPointModel: ModelType<KaspiStorePickupPointModel>
    ) {}

    async authToKaspi(login: string, password: string): Promise<KaspiCookieDto> {
        console.log("auto to kaspi", login, password)

        const kaspiCookie = new KaspiCookieDto()
        kaspiCookie.isAuthorized = false

        let isError = false

        for (let attempt = 0; attempt < 3; attempt++) {
            if (kaspiCookie.isAuthorized) {
                break
            }

            const proxy = await this.proxyService.getRandomModem()

            // console.log('PROXY:', proxy.proxy)

            const search = new URLSearchParams()
            search.append('email', login)
            search.append('password', password)
            search.append('host', proxy.host + ':' + proxy.port)
            search.append('token', token)
            search.append('proxyLogin', proxy.login)
            search.append('proxyPassword', proxy.password)

            const url = `${AUTH_SERVICE_URL}/api/auth/kaspi/?${search.toString()}`

            // console.log(url)

            // console.log(`AUTH TO KASPI | ${new Date()}`)
            try{
                const data = await axios.get(url)
                if (data.data.cookie) {
                    console.log(data.data)
                    // console.log(`AUTHORIZED TO KASPI STORE | ${login} | ${new Date()}`)
                    isError = false
                    kaspiCookie.isAuthorized = true
                    kaspiCookie.userAgent = data.data.user_agent
                    kaspiCookie.cookie = data.data.cookie
                    kaspiCookie.storeId = data.data.storeId
                    return kaspiCookie
                } else if (!data) {
                    console.log(`BAD CREDENTIALS | ${login} | ${new Date()}`)
                }
            }
            catch(err){
                isError = true
                console.log('[^]' + ' kaspi.sarvice ' + ' | ' + new Date() + ' | ' + '\n'+err);
                // console.log(err?.response?.status, err?.message, err?.response?.data)
            }
        }

        if (isError) {
            throw new BadRequestException()
        }

        return kaspiCookie
    }

    async getStoreData(cookie: string, userAgent = '', storeId: string | null = null): Promise<KaspiSettingsDto> {
        const kaspiSettings = new KaspiSettingsDto()
        kaspiSettings.isAuthorized = false
        kaspiSettings.isError = false

        let isFound = false
        for (let attempt = 0; attempt < 3 && !isFound; attempt++) {
            const proxy = await this.proxyService.getRandomModem()

            const proxyOpts = parse(proxy.proxy)
            proxyOpts.auth = `${proxy.login}:${proxy.password}`
            const agent = new HttpsProxyAgent(proxyOpts)
    
            const url = `https://mc.shop.kaspi.kz/mc/facade/graphql?opName=getMerchant`
            
            const body = {
                "operationName": 'getMerchant',
                "query":"query getMerchant($id: String!) {\n  merchant(id: $id) {\n    id\n    name\n    logo {\n      url\n      __typename\n    }\n    schedule {\n      weekdays {\n        closingTime\n        dayOfWeek\n        openingTime\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n  session {\n    merchants(id: $id) {\n      userName\n      name\n      master\n      __typename\n    }\n    __typename\n  }\n}\n",
                "variables": {
                    "id": storeId
                }
    
            }

            const headers = {
                'cookie': cookie,
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
            };
            await axios
                .post(url,body, {
                    headers: headers,
                    httpsAgent: agent,
                    timeout: 5000,
                })
                .then((data) => {
                    console.log('databek',data.data.data
                    )
                    if (!data?.data?.data.merchant.name) {
                        return
                    }
    
                    isFound = true
    
                    kaspiSettings.cookie = cookie
                    kaspiSettings.logo = data.data.data.merchant.logo.url
                    kaspiSettings.name = data.data.data.merchant.name
                    kaspiSettings.url = `https://kaspi.kz/shop/info/merchant/${storeId}/address-tab/`
                    kaspiSettings.isAuthorized = true
                    kaspiSettings.storeId = data.data.data.merchant.id
                    return kaspiSettings
                })
                .catch((err) => {
                    kaspiSettings.isError = true
    
                    console.log(err?.response?.message, err?.message, url, new Date())
                    console.log('[^]' + ' kaspi.sarvice ' + ' | ' + new Date() + ' | ' + '\n'+err);
    
                    // throw new InternalServerErrorException('Ошибка сервера')
                })
        }

        return kaspiSettings
    }

    async getSettings(login: string, password: string, storeId: string | null = null): Promise<KaspiSettingsDto> {
        const kaspiCookie = await this.authToKaspi(login, password)

        if (!kaspiCookie.isAuthorized) {
            throw new BadRequestException(KASPI_BAD_CREDENTIALS_ERROR)
        }

        if (kaspiCookie.isAuthorized) {
            return await this.getStoreData(kaspiCookie.cookie, kaspiCookie.userAgent, kaspiCookie.storeId)
        }

        const kaspiSettings = new KaspiSettingsDto()
        kaspiSettings.isAuthorized = false

        return kaspiSettings
    }

    async checkKaspiCredentials(login: string, password: string): Promise<KaspiSettingsDto> {
        const kaspiSettings = await this.getSettings(login, password)

        return kaspiSettings
    }

    async getHeaders(cookie?: string, referer = '') {
        const firstUserAgent = new UserAgent()
        const userAgent = firstUserAgent.random().toString()

        return {
            'User-agent': userAgent,
            'Cookie': cookie,
            'Accept-Language': 'ru-RU,ru;q=0.9,en-GB;q=0.8,en;q=0.7,ru-KZ;q=0.6,en-US;q=0.5',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept': 'application/json',
            'Referer': referer,
        }
    }

    async loadLastMonthOrdersFromKaspi(apiToken: string) {
        const pageNumber = 0
        const pageSize = 10
        const creationDateGE = new Date().getTime() - 1000 * 60

        const link = `https://kaspi.kz/shop/api/v2/orders?page[number]=${pageNumber}&page[size]=${pageSize}&filter[orders][state]=NEW&filter[orders][creationDate][$ge]=${creationDateGE}`

        const proxy = await this.proxyService.getRandomProxy()
        const proxyOpts = parse(proxy.proxy)
        proxyOpts.auth = `${proxy.login}:${proxy.password}`
        const agent = new HttpsProxyAgent(proxyOpts)

        const result = await axios
            .get(link, {
                headers: this.getHeader(apiToken),
                httpsAgent: agent,
                timeout: 15000,
            })
            .then(() => {
                return {
                    isValidToken: true,
                }
            })
            .catch((err) => {
                if (err?.response?.data?.message?.includes('authentication is required to access')) {
                    return {
                        isValidToken: false,
                    }
                }
            })

        // console.log(result)

        if (!result?.isValidToken) {
            throw new BadRequestException('Неправильный токен')
        }

        return result?.isValidToken || false
    }

    private getHeader(apiToken: string) {
        return {
            'X-Auth-Token': apiToken,
            'Content-Type': 'application/json',
        }
    }

    async checkApiToken(cookie: string, storeId: string) {
        try {
            let apiToken = await this.getApiToken(cookie)

            if (!apiToken) {
                apiToken = await this.postApiToken(cookie)
            }

            if (apiToken) {
                await this.storeModel.updateOne({ _id: storeId }, { apiToken })
            }
        } catch (e) {
            console.log('[^]' + ' kaspi.sarvice ' + ' | ' + new Date() + ' | ' + '\n'+e);
        }
    }

    private async postApiToken(cookie: string) {
        let token = ''

        await axios
            .post(
                'https://kaspi.kz/merchantcabinet/api/merchant/apiAuthToken',
                {},
                {
                    headers: this.proxyService.getHeaders(cookie),
                }
            )
            .then((data) => {
                if (data.data) {
                    token = data.data
                }
            })
            .catch((err) => {
                console.log('[^]' + ' kaspi.sarvice ' + ' | ' + new Date() + ' | ' + '\n'+err);
                token = ''
            })

        return token
    }

    private async getApiToken(cookie: string) {
        let token = ''

        await axios
            .get('https://kaspi.kz/merchantcabinet/api/merchant/apiAuthToken', {
                headers: this.proxyService.getHeaders(cookie),
            })
            .then((data) => {
                if (data.data) {
                    token = data.data
                }
            })
            .catch((err) => {
                console.log('[^]' + ' kaspi.sarvice ' + ' | ' + new Date() + ' | ' + '\n'+err);
                token = ''
            })

        return token
    }

    async withdrawProductsFromSale(merchantProductCodes: string, cookie: string) {
        const proxy = await this.proxyService.getRandomProxy()
        const proxyOpts = parse(proxy.proxy)
        proxyOpts.auth = `${proxy.login}:${proxy.password}`
        const agent = new HttpsProxyAgent(proxyOpts)

        return await axios
            .post(
                'https://kaspi.kz/merchantcabinet/api/offer/expire',
                {
                    merchantProductCodes,
                },
                {
                    headers: this.proxyService.getHeaders(cookie),
                    httpsAgent: agent,
                    timeout: 5000,
                }
            )
            .then((data) => {
                return {
                    isError: false,
                    ...data.data,
                }
            })
            .catch((err) => {
                console.log('[^]' + ' kaspi.sarvice ' + ' | ' + new Date() + ' | ' + '\n'+err);

                return {
                    isError: true,
                }
            })
    }

    async sendPinCode(phone: string) {
        let userAgent = ''
        let cookie = ''
        let sessionId = ''
        let statusCode = 200
        let isError = false
        
        const MAX_ATTEMPTS = 3
        const RETRY_DELAY = 200 // Уменьшена задержка между попытками
        
        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
            if (attempt > 1) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
            }

            const proxy = await this.proxyService.getRandomModem()
    
            const search = new URLSearchParams()
            search.append('phone', phone)
            search.append('host', proxy.host + ':' + proxy.port)
            search.append('token', token)
            search.append('proxyLogin', proxy.login)
            search.append('proxyPassword', proxy.password)
    
            const url = `${AUTH_SERVICE_URL}/api/auth/kaspi/phone/?${search.toString()}`
            
            try {
                const response = await axios.get(url, {
                    timeout: 10000, // Уменьшен timeout до 10 секунд
                })
                
                if (response.status === 200) {
                    const data = response
                    
                    // Проверяем успешную отправку: is_send должен быть true И is_error должен быть false
                    const isSuccess = data.data.is_send === true && data.data.is_error !== true && (data.data.status === 200 || !data.data.status)
                    
                    if (isSuccess) {
                        cookie = data.data.cookie || ''
                        statusCode = data.data.status || 200
                        isError = false
                        userAgent = data.data.user_agent || ''
                        sessionId = data.data.sessionId || '' // sessionId для использования сохраненного клиента (как на проде)
                        break // Выходим из цикла после успешной отправки - НЕ ДЕЛАЕМ ПОВТОРНЫХ ПОПЫТОК
                    } else {
                        isError = true
                        statusCode = data.data.status || 500
                        if (statusCode === 400 || statusCode === 401 || statusCode === 403) {
                            break
                        }
                        // Продолжаем попытки только если это не критическая ошибка И код не был отправлен
                    }
                } else if (response.status >= 400 && response.status < 500) {
                    isError = true
                    statusCode = response.status
                    break
                }
            } catch (err: any) {
                isError = true
                
                // ✅ Retry только при сетевых ошибках (timeout, connection reset и т.д.)
                // НЕ делаем retry при успешной отправке SMS (это предотвратит отправку нескольких кодов)
                if (err.code === 'ECONNABORTED' || err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND') {
                    if (attempt === MAX_ATTEMPTS) {
                        statusCode = 500
                    }
                    continue
                }
                statusCode = err.response?.status || 500
                if (statusCode >= 400 && statusCode < 500) {
                    break
                }
            }
        }

        return {
            statusCode,
            userAgent,
            cookie,
            isError,
            sessionId, // sessionId для использования сохраненного клиента (как на проде)
        }
    }

    async verifyStorePhone(pin: string, c: string, ua: string, sessionId?: string): Promise<{ statusCode: number; cookie: string; isError: boolean; storeId: string; userAgent: string; email?: string; password?: string }> {
        let cookie = ''
        let statusCode = 200
        let isError = false
        let storeId = ''
        let userAgent = ua // Используем переданный userAgent по умолчанию
        let email: string | undefined = undefined
        let password: string | undefined = undefined

        const MAX_ATTEMPTS = 5
        const RETRY_DELAY = 200
        
        for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
            if (attempt > 0) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
            }

            const proxy = await this.proxyService.getRandomModem()

            const search = new URLSearchParams()
            search.append('host', proxy.host + ':' + proxy.port)
            search.append('token', token)
            search.append('proxyLogin', proxy.login)
            search.append('proxyPassword', proxy.password)

            const body: any = {
                code: pin,
                cookie: c,
                userAgent: ua,
            }
            
            // Если есть sessionId, передаем его для использования сохраненного клиента (как на проде)
            if (sessionId) {
                body.sessionId = sessionId
            }
            
            // Передаем storeId если он есть (для существующих магазинов)
            // Для новых магазинов storeId будет "pending", и мы обновим его позже
            // Но пока не передаем, так как для новых магазинов его еще нет

            const url = `${AUTH_SERVICE_URL}/api/auth/kaspi/phone/verify/?${search.toString()}`

            try {
                const data = await axios.post(url, body, {
                    timeout: 5000, // Увеличиваем timeout до 30 секунд (как на проде)
                })

                // Проверяем успешную верификацию: statusCode === 200 И isError === false
                if (data.data?.statusCode === 200 && data.data?.isError === false) {
                    cookie = data.data.cookie || ''
                    statusCode = 200
                    isError = false
                    storeId = data.data.storeId || ''
                    // Используем user_agent из ответа, если он есть, иначе используем переданный
                    userAgent = data.data.user_agent || data.data.userAgent || ua
                    // Извлекаем email и password, если они есть в ответе
                    email = data.data.email || undefined
                    password = data.data.password || undefined
                    break // ВАЖНО: выходим сразу после успешной верификации, НЕ ДЕЛАЕМ ПОВТОРНЫХ ПОПЫТОК
                } else {
                    statusCode = data.data?.statusCode || 500
                    isError = true
                    // Если код уже использован (400) или другие критические ошибки - прекращаем попытки
                    if (statusCode === 400 || statusCode === 401 || statusCode === 403) {
                        break
                    }
                    // Продолжаем попытки только если это не критическая ошибка
                }
            } catch (err: any) {
                isError = true
                statusCode = err.response?.status || 500
                
                // Если получили 200 в response, но была ошибка сети - проверяем данные
                if (err.response?.status === 200 && err.response?.data) {
                    const responseData = err.response.data
                    if (responseData.statusCode === 200 && responseData.isError === false) {
                        cookie = responseData.cookie || ''
                        statusCode = 200
                        isError = false
                        storeId = responseData.storeId || ''
                        // Используем user_agent из ответа, если он есть
                        userAgent = responseData.user_agent || responseData.userAgent || ua
                        // Извлекаем email и password, если они есть в ответе
                        email = responseData.email || undefined
                        password = responseData.password || undefined
                        break
                    }
                }
                
                // Критические ошибки - прекращаем попытки
                if (statusCode === 400 || statusCode === 401 || statusCode === 403) {
                    break
                }
                
                // Сетевые ошибки - пробуем еще раз (только если не последняя попытка)
                if (err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === 'ENOTFOUND' || err.code === 'ECONNABORTED') {
                    if (attempt === MAX_ATTEMPTS - 1) {
                        statusCode = 500
                        break
                    } else {
                        continue
                    }
                }
                
                // Если последняя попытка - выходим
                if (attempt === MAX_ATTEMPTS - 1) {
                    break
                }
            }
        }

        return {
            statusCode,
            cookie,
            isError,
            storeId,
            userAgent, // Возвращаем userAgent из ответа auth-api или переданный
            email, // Возвращаем email, если пользователь был создан в auth-api
            password, // Возвращаем password, если пользователь был создан в auth-api
        }
    }

    /**
     * Создает пользователя в Kaspi кабинете через auth-api
     * Вызывается неблокирующе после регистрации магазина
     */
    async createKaspiUser(dto: {
        storeId: string
        kaspiStoreId: string
        cookie: string
        userAgent: string
    }): Promise<{ success: boolean; email?: string; password?: string; error?: string }> {
        console.log(`[KASPI_SERVICE] 🚀 createKaspiUser вызван`)
        console.log(`[KASPI_SERVICE]    StoreId: ${dto.storeId}`)
        console.log(`[KASPI_SERVICE]    KaspiStoreId: ${dto.kaspiStoreId}`)
        console.log(`[KASPI_SERVICE]    Cookie length: ${dto.cookie?.length || 0}`)
        console.log(`[KASPI_SERVICE]    UserAgent: ${dto.userAgent ? dto.userAgent.substring(0, 50) + '...' : 'нет'}`)
        console.log(`[KASPI_SERVICE]    AUTH_SERVICE_URL: ${AUTH_SERVICE_URL}`)
        console.log(`[KASPI_SERVICE]    MARKETPLACE_AUTH_TOKEN: ${token ? 'есть' : 'отсутствует'}`)
        
        try {
            // Проверяем доступность Auth-API (неблокирующая проверка)
            // В Auth-API все роуты находятся под /api, поэтому health check на /api/
            console.log(`[KASPI_SERVICE] 🔍 Проверяем доступность Auth-API: ${AUTH_SERVICE_URL}/api/`)
            try {
                await axios.get(`${AUTH_SERVICE_URL}/api/`, { timeout: 3000 }).catch(() => null)
                console.log(`[KASPI_SERVICE] ✅ Auth-API доступен`)
            } catch (error: any) {
                console.warn(`[KASPI_SERVICE] ⚠️  Health check не прошел, но продолжаем: ${error.message}`)
            }
            
            console.log(`[KASPI_SERVICE] 🔍 Получаем proxy...`)
            let proxy
            try {
                proxy = await this.proxyService.getRandomModem()
                if (!proxy) {
                    console.error(`[KASPI_SERVICE] ❌ getRandomModem вернул null`)
                    return {
                        success: false,
                        error: 'Proxy not available (null)',
                    }
                }
                console.log(`[KASPI_SERVICE] ✅ Proxy получен: ${proxy.host}:${proxy.port}`)
            } catch (proxyError: any) {
                console.error(`[KASPI_SERVICE] ❌ Ошибка получения proxy:`, proxyError.message)
                console.error(`[KASPI_SERVICE]    Stack:`, proxyError.stack?.substring(0, 200))
                return {
                    success: false,
                    error: `Proxy error: ${proxyError.message}`,
                }
            }

            const search = new URLSearchParams()
            search.append('host', proxy.host + ':' + proxy.port)
            search.append('token', token)
            search.append('proxyLogin', proxy.login)
            search.append('proxyPassword', proxy.password)

            const url = `${AUTH_SERVICE_URL}/api/kaspi-user/create?${search.toString()}`

            const pleskCookie = process.env.PLESK_COOKIE
            
            console.log(`[KASPI_SERVICE] 📤 Отправляем запрос на создание пользователя: ${url}`)
            console.log(`[KASPI_SERVICE]    Body: storeId=${dto.storeId}, kaspiStoreId=${dto.kaspiStoreId}, cookie length=${dto.cookie?.length || 0}`)
            
            const response = await axios.post(
                url,
                {
                    storeId: dto.storeId,
                    kaspiStoreId: dto.kaspiStoreId,
                    cookie: dto.cookie,
                    userAgent: dto.userAgent,
                    pleskCookie: pleskCookie, // Cookie для Plesk API (если есть)
                },
                {
                    timeout: 60000, // 60 секунд для создания пользователя
                }
            )
            
            console.log(`[KASPI_SERVICE] 📥 Ответ от auth-api: status=${response.status}, success=${response.data?.success}`)
            
            if (response.data?.success) {
                console.log(`[KASPI_SERVICE] ✅ Пользователь успешно создан: ${response.data?.email}`)
                return {
                    success: true,
                    email: response.data?.email,
                    password: response.data?.password,
                }
            } else {
                console.error(`[KASPI_SERVICE] ❌ Ошибка создания пользователя: ${response.data?.error || 'Unknown error'}`)
                console.error(`[KASPI_SERVICE]    Status: ${response.data?.status || 'не указан'}`)
                return {
                    success: false,
                    error: response.data?.error || 'Unknown error',
                }
            }
        } catch (error: any) {
            console.error(`[KASPI_SERVICE] ❌ Исключение при создании пользователя:`, error.message)
            if (error.response) {
                console.error(`[KASPI_SERVICE]    Response status: ${error.response.status}`)
                console.error(`[KASPI_SERVICE]    Response data:`, JSON.stringify(error.response.data || {}).substring(0, 500))
            }
            if (error.code) {
                console.error(`[KASPI_SERVICE]    Error code: ${error.code}`)
            }
            return {
                success: false,
                error: error.message || 'Failed to create Kaspi user',
            }
        }
    }
}