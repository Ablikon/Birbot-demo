import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export interface KaspiAPIPaymentsModel extends Base {}

export class KaspiAPIPaymentsModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true })
    authorId: Types.ObjectId

    @prop({ type: () => String, required: false })
    merchantId: string

    @prop({ type: () => String, required: false })
    transactionId: string

    @prop({ type: () => Number, required: true })
    amount: number

    @prop({ type: () => Number, required: false })
    paymentId: number

    @prop({ type: () => String, required: false })
    qrToken: string

    @prop({ type: () => String, required: false })
    paymentLink: string

    @prop({ type: () => Array, required: true })
    paymentMethods: string[]

    @prop({ type: () => Object, required: false, default: null })
    paymentBehaviorOptions: {
        qrCodeScanWaitTimeout?: number | null,
        linkActivationWaitTimeout?: number | null,
        paymentConfirmationTimeout?: number,
        statusPollingInterval?: number
    }

    @prop({ type: () => String, required: true })
    expireDate: String

    @prop({ type: () => String, required: false })
    status: string

    @prop({ type: () => Number, required: false })
    loanTerm: number

    @prop({ type: () => Boolean, required: false })
    isOffer: boolean

    @prop({ type: () => Number, required: false })
    refundAmount: number   
}
