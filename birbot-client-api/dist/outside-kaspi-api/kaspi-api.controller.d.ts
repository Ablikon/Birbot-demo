import { KaspiAPIService } from './kaspi-api.service';
export declare class kaspiAPIController {
    private readonly kaspiAPIService;
    constructor(kaspiAPIService: KaspiAPIService);
    createLink(dto: {
        externalId: string;
        amount: number;
        merchantId: string;
    }, req: any): Promise<any>;
    createToken(dto: {
        externalId: string;
        amount: number;
        merchantId: string;
    }, req: any): Promise<any>;
    getPaymentStatus(paymentId: number, req: any): Promise<any>;
    reufndPurchase(dto: {
        paymentId: number;
        amount: number;
        merchantId: string;
    }, req: any): Promise<any>;
}
