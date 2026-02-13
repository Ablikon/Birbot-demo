import { Types } from 'mongoose'
import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

// Define interface for refund reason
interface RefundReason {
    reason: string
    reasonDescription: string
}

// Define interface for address
interface Address {
    cityId: string
    street: string
    house: string
    apartment: string
    lat: number | null
    lng: number | null
    simpleFormat: string
}

// Define interface for action
interface Action {
    actionType: string
    acceptWarning: string | null
    rejectWarning: string | null
}

// Define interface for state step
interface StateStep {
    title: string
    stepStatus: string
    delayed: boolean
    stage: string
    result: string | null
    expirationTime: Date
    actionAvailableUntil: Date | null
    comment: string | null
    additionalText: string | null
    inspectionResultUrl: string | null
    stepAction: string | null
    stepType: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RefundModel extends Base {}
export class RefundModel extends TimeStamps {
    @prop({ required: true })
    storeId!: Types.ObjectId

    @prop({ required: true })
    refundId!: string

    @prop({ required: true })
    applicationNumber!: string

    @prop({ required: true })
    responsible!: string

    @prop({ required: true })
    order!: string

    @prop({ required: true })
    customerId!: string

    @prop({ required: true })
    customerName!: string

    @prop({ required: true })
    customerPhone!: string

    @prop()
    refundReason?: RefundReason | null

    @prop({ required: true })
    deliveryType!: string

    @prop({ required: true })
    refundTab!: string

    @prop()
    address?: Address | null

    @prop()
    orderAddress?: Address | null

    @prop({ required: true })
    productSku!: string

    @prop({ required: true })
    quantity!: number

    @prop({ required: true })
    productPrice!: number

    @prop({ required: true })
    total!: number

    @prop({ required: true })
    totalWithdraw!: number

    @prop({ required: true })
    weight!: number

    @prop({ required: true })
    unit!: string

    @prop({ default: '' })
    rejectDescription!: string

    @prop()
    comment?: string | null

    @prop({ required: true })
    stepDescription!: string

    @prop({ required: true })
    examinationProtocolExist!: boolean

    @prop({ required: true })
    actions!: Action[]

    @prop({ required: true })
    stateSteps!: StateStep[]

    @prop({ required: true })
    imageUrls!: string[]

    @prop()
    orderCompletionDate?: Date | null

    @prop()
    daysCountBetweenRefundCreationAndOrderCompletion?: number | null

    @prop({ required: true })
    createdDate!: Date
}
