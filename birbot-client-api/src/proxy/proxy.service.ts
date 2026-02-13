import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { ModelType, DocumentType } from '@typegoose/typegoose/lib/types'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { Types } from 'mongoose'
import { InjectModel } from 'nestjs-typegoose'
import { parse } from 'url'
import { CreateProxyDto } from './dto/create-proxy.dto'
import { UpdateProxyDto } from './dto/update-proxy.dto'
import { PROXY_ALREADY_EXISTS_ERROR, PROXY_NOT_FOUND_ERROR } from './proxy.constants'
import { ProxyModel } from './proxy.model'
const UserAgent = require('user-agents')

@Injectable()
export class ProxyService {
    constructor(@InjectModel(ProxyModel) private readonly proxyModel: ModelType<ProxyModel>) {}

    async getRandomProxy(type = 'MERCHANTCABINET'): Promise<DocumentType<ProxyModel>> | null {
        const proxies = await this.proxyModel.find({
            type,
            isActive: true,
        })

        if (proxies.length === 0) {
            throw new NotFoundException(PROXY_NOT_FOUND_ERROR)
        }

        const randomProxy = proxies[parseInt(Math.random() * proxies.length + '')]

        return randomProxy
    }
    async getRandomModem(): Promise<DocumentType<ProxyModel>> | null {
        let proxies = await this.proxyModel.find({
            isActive: true,
            phoneName: { $regex: /Модем/}
        })
        if (proxies.length === 0) {
            proxies = await this.proxyModel.find({
                isActive: true,
            })
        }

        if (proxies.length === 0) {
            throw new NotFoundException(PROXY_NOT_FOUND_ERROR)
        }
        
        const randomProxy = proxies[parseInt(Math.random() * proxies.length + '')]

        return randomProxy
    } 

    async getRandomProxyForSales(): Promise<DocumentType<ProxyModel>> | null {
        const proxies = await this.proxyModel.find({
            type: 'MERCHANTCABINET',
            isActive: true,
        })

        if (proxies.length === 0) {
            throw new NotFoundException(PROXY_NOT_FOUND_ERROR)
        }

        const randomProxy = proxies[parseInt(Math.random() * proxies.length + '')]

        return randomProxy
    }

    async addProxy(userId: string, dto: CreateProxyDto) {
        const oldProxy = await this.proxyModel.findOne({
            userId,
            proxy: `http://${dto.host}:${dto.port}`,
        })

        if (oldProxy) {
            throw new BadRequestException(PROXY_ALREADY_EXISTS_ERROR)
        }

        const newProxy = new this.proxyModel({
            userId: new Types.ObjectId(userId),
            proxy: `http://${dto.host}:${dto.port}`,
            host: dto.host,
            port: dto.port,
            login: dto.login,
            password: dto.password,
        })

        return await newProxy.save()
    }

    async deleteProxy(proxyId: string) {
        const oldProxy = await this.proxyModel.findOne({ _id: proxyId })
        if (!oldProxy) {
            throw new NotFoundException(PROXY_NOT_FOUND_ERROR)
        }

        this.proxyModel.deleteOne({ _id: new Types.ObjectId(proxyId) }).exec()
    }

    async getActiveProxies() {
        return {
            count: await this.proxyModel.count({
                isActive: true,
            }),
            total: await this.proxyModel.count({}),
        }
    }

    async updateProxy(dto: UpdateProxyDto, proxyId: string) {
        const oldProxy = await this.proxyModel.findOne({ _id: proxyId })

        if (!oldProxy) {
            throw new NotFoundException(PROXY_NOT_FOUND_ERROR)
        }

        const host = dto.host || oldProxy.host
        const port = dto.port || oldProxy.port

        await this.proxyModel.updateOne(
            { _id: new Types.ObjectId(proxyId) },
            {
                login: dto.login,
                password: dto.password,
                host,
                port,
                proxy: `http://${host}:${port}`,
            }
        )
    }

    async getAllProxies() {
        const result = []

        const proxies = await this.proxyModel.find({})

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
            })
        }

        return result
    }

    getHttpsAgent(proxy: ProxyModel) {
        const proxyOpts = parse(proxy.proxy)
        proxyOpts.auth = `${proxy.login}:${proxy.password}`
        const agent = new HttpsProxyAgent(proxyOpts)

        return agent
    }

    getHeaders(cookie = '', userAgent = '') {
        if (!userAgent) {
            userAgent = this.getRandomUserAgent().toString()
        }

        const referer = `https://kaspi.kz/merchantcabinet/`

        return {
            'Connection': 'close',
            'Cookie': cookie,
            'Host': 'kaspi.kz',
            'Origin': 'https://kaspi.kz',
            'Referer': referer,
            'User-Agent': userAgent,
        }
    }

    getRandomUserAgent() {
        const firstUserAgent = new UserAgent()
        const userAgent = firstUserAgent.random()

        return userAgent
    }
}
