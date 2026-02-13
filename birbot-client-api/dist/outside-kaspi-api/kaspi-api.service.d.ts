import { ModelType } from '@typegoose/typegoose/lib/types';
import { KaspiAPIPaymentsModel } from './kaspi-api.model';
export declare class KaspiAPIService {
    private readonly kaspiAPIPaymentModel;
    constructor(kaspiAPIPaymentModel: ModelType<KaspiAPIPaymentsModel>);
    getPaymentStatus(paymentId: number, userId: string): Promise<any>;
    createQrToken({ amount, externalId, merchantId, userId }: {
        amount: number;
        externalId: string;
        merchantId: string;
        userId: string;
    }): Promise<any>;
    createQrLink({ amount, externalId, merchantId, userId }: {
        amount: number;
        externalId: string;
        merchantId: string;
        userId: string;
    }): Promise<any>;
    refundPurchase({ paymentId, amount, merchantId, userId }: {
        paymentId: number;
        amount: number;
        merchantId: string;
        userId: string;
    }): Promise<any>;
}
