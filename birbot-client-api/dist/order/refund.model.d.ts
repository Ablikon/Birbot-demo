import { Types } from 'mongoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
interface RefundReason {
    reason: string;
    reasonDescription: string;
}
interface Address {
    cityId: string;
    street: string;
    house: string;
    apartment: string;
    lat: number | null;
    lng: number | null;
    simpleFormat: string;
}
interface Action {
    actionType: string;
    acceptWarning: string | null;
    rejectWarning: string | null;
}
interface StateStep {
    title: string;
    stepStatus: string;
    delayed: boolean;
    stage: string;
    result: string | null;
    expirationTime: Date;
    actionAvailableUntil: Date | null;
    comment: string | null;
    additionalText: string | null;
    inspectionResultUrl: string | null;
    stepAction: string | null;
    stepType: string;
}
export interface RefundModel extends Base {
}
export declare class RefundModel extends TimeStamps {
    storeId: Types.ObjectId;
    refundId: string;
    applicationNumber: string;
    responsible: string;
    order: string;
    customerId: string;
    customerName: string;
    customerPhone: string;
    refundReason?: RefundReason | null;
    deliveryType: string;
    refundTab: string;
    address?: Address | null;
    orderAddress?: Address | null;
    productSku: string;
    quantity: number;
    productPrice: number;
    total: number;
    totalWithdraw: number;
    weight: number;
    unit: string;
    rejectDescription: string;
    comment?: string | null;
    stepDescription: string;
    examinationProtocolExist: boolean;
    actions: Action[];
    stateSteps: StateStep[];
    imageUrls: string[];
    orderCompletionDate?: Date | null;
    daysCountBetweenRefundCreationAndOrderCompletion?: number | null;
    createdDate: Date;
}
export {};
