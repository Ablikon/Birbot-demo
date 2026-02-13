/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose/types/inferschematype" />
import { ModelType, DocumentType } from '@typegoose/typegoose/lib/types';
import { Types } from 'mongoose';
import { CreateProxyDto } from './dto/create-proxy.dto';
import { UpdateProxyDto } from './dto/update-proxy.dto';
import { ProxyModel } from './proxy.model';
export declare class ProxyService {
    private readonly proxyModel;
    constructor(proxyModel: ModelType<ProxyModel>);
    getRandomProxy(type?: string): Promise<DocumentType<ProxyModel>> | null;
    getRandomModem(): Promise<DocumentType<ProxyModel>> | null;
    getRandomProxyForSales(): Promise<DocumentType<ProxyModel>> | null;
    addProxy(userId: string, dto: CreateProxyDto): Promise<import("mongoose").Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & ProxyModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    deleteProxy(proxyId: string): Promise<void>;
    getActiveProxies(): Promise<{
        count: number;
        total: number;
    }>;
    updateProxy(dto: UpdateProxyDto, proxyId: string): Promise<void>;
    getAllProxies(): Promise<any[]>;
    getHttpsAgent(proxy: ProxyModel): import("https-proxy-agent/dist/agent").default;
    getHeaders(cookie?: string, userAgent?: string): {
        Connection: string;
        Cookie: string;
        Host: string;
        Origin: string;
        Referer: string;
        'User-Agent': string;
    };
    getRandomUserAgent(): any;
}
