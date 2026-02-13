import { ModelType } from '@typegoose/typegoose/lib/types';
import { ProxyService } from 'src/proxy/proxy.service';
import { KaspiCookieDto } from './dto/kaspi-cookie.dto';
import { KaspiSettingsDto } from './dto/kaspi-settings.dto';
import { StoreModel } from './store.model';
import { KaspiStorePickupPointModel } from './kaspi-store-pickup-point.model';
export declare class KaspiService {
    private readonly proxyService;
    private readonly storeModel;
    private readonly kaspiStorePickupPointModel;
    constructor(proxyService: ProxyService, storeModel: ModelType<StoreModel>, kaspiStorePickupPointModel: ModelType<KaspiStorePickupPointModel>);
    authToKaspi(login: string, password: string): Promise<KaspiCookieDto>;
    getStoreData(cookie: string, userAgent?: string, storeId?: string | null): Promise<KaspiSettingsDto>;
    getSettings(login: string, password: string, storeId?: string | null): Promise<KaspiSettingsDto>;
    checkKaspiCredentials(login: string, password: string): Promise<KaspiSettingsDto>;
    getHeaders(cookie?: string, referer?: string): Promise<{
        'User-agent': any;
        Cookie: string;
        'Accept-Language': string;
        'Accept-Encoding': string;
        Accept: string;
        Referer: string;
    }>;
    loadLastMonthOrdersFromKaspi(apiToken: string): Promise<boolean>;
    private getHeader;
    checkApiToken(cookie: string, storeId: string): Promise<void>;
    private postApiToken;
    private getApiToken;
    withdrawProductsFromSale(merchantProductCodes: string, cookie: string): Promise<any>;
    sendPinCode(phone: string): Promise<{
        statusCode: number;
        userAgent: string;
        cookie: string;
        isError: boolean;
        sessionId: string;
    }>;
    verifyStorePhone(pin: string, c: string, ua: string, sessionId?: string): Promise<{
        statusCode: number;
        cookie: string;
        isError: boolean;
        storeId: string;
        userAgent: string;
        email?: string;
        password?: string;
    }>;
    createKaspiUser(dto: {
        storeId: string;
        kaspiStoreId: string;
        cookie: string;
        userAgent: string;
    }): Promise<{
        success: boolean;
        email?: string;
        password?: string;
        error?: string;
    }>;
}
