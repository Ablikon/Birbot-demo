import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface KaspiAPIPaymentsModel extends Base {
}
export declare class KaspiAPIPaymentsModel extends TimeStamps {
    authorId: Types.ObjectId;
    merchantId: string;
    transactionId: string;
    amount: number;
    paymentId: number;
    qrToken: string;
    paymentLink: string;
    paymentMethods: string[];
    paymentBehaviorOptions: {
        qrCodeScanWaitTimeout?: number | null;
        linkActivationWaitTimeout?: number | null;
        paymentConfirmationTimeout?: number;
        statusPollingInterval?: number;
    };
    expireDate: String;
    status: string;
    loanTerm: number;
    isOffer: boolean;
    refundAmount: number;
}
