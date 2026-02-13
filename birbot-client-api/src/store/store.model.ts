import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

import { Types } from 'mongoose'

class MainCity {
    @prop({ type: () => String, default: '750000000' })
    id: string

    @prop({ type: () => String, default: 'Алматы' })
    name: string

    @prop({ type: () => Boolean, default: false })
    isDempingOnlyThisCity: boolean

    @prop({ type: () => String, default: '750000000' })
    dempingCityId: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StoreModel extends Base {}

export class StoreModel extends TimeStamps {
    @prop({
        type: () => Types.ObjectId,
        required: true,
    })
    marketplaceId: Types.ObjectId

    @prop({
        type: () => Types.ObjectId,
        required: true,
    })
    userId: Types.ObjectId

    @prop({
        type: () => Date,
        required: true,
    })
    expireDate: Date

    @prop({ type: () => String, required: false, default: '' })
    login: string

    @prop({ type: () => String, required: false, default: '' })
    password: string

    @prop({ type: () => String, default: '' })
    name: string

    @prop({ type: () => String, default: '' })
    slug: string

    @prop({ type: () => String, default: '' })
    storeId: string

    @prop({ type: () => String, default: '' })
    logo: string

    @prop({ type: () => String, default: '' })
    url: string

    @prop({ type: () => Boolean, default: true })
    isStarted: boolean

    @prop({ type: () => Boolean, default: false })
    isProcessing: boolean

    @prop({ type: () => Boolean, default: false })
    isBadCredentials: boolean

    @prop({ type: () => Date, default: null })
    unauthDate: Date | null

    @prop({ type: () => Boolean, default: true })
    isTest: boolean

    @prop({ type: () => MainCity, default: {} })
    mainCity: MainCity

    @prop({ type: () => Number, default: 0 })
    cityLimit: number

    @prop({ type: () => String, default: '' })
    cookie: string

    @prop({ type: () => Number, default: 1 })
    dempingPrice: number

    @prop({ type: () => String, default: '' })
    apiToken: string

    @prop({ type: () => Boolean, default: false })
    isUpdatedLeadTest: boolean

    @prop({ type: () => Boolean, default: true })
    isAutoRaise: boolean

    @prop({ type: () => String, default: '' })
    phone: string

    @prop({ type: () => String, default: '' })
    userAgent: string

    @prop({ type: () => Number, default: 999999 })
    maxDempingProducts: number

    @prop({ type: () => String })
    storeCode: string

    @prop({ type: () => Number, default: 5 })
    maxNotCompeteStoreCount: number

    @prop({ type: () => String, default: 'NEW' })
    requestType: string

    

    @prop({ type: () => String, default: 'REQUEST' })
    changePriceMethod: string

    @prop({ type: () => Date, default: null })
    orderStatusExpireDate: Date | null

    @prop({ type: () => String, default: '' })
    token: string

    @prop({ type: () => Boolean, default: true })
    userStartBotAccess: boolean

    @prop({ type: () => Boolean, default: false })
    merchantOrderAccess: boolean

    @prop({ type: () => Boolean, default: true })
    auctionAccess: boolean

    @prop({ type: () => Boolean, default: true })
    isSendPhoneAuthorizationMessage

    @prop({ type: () => Boolean, default: false })
    isDempingOnLoanPeriod

    @prop({ type: () => Boolean, default: false })
    isPartcipiateInPaymentsAction

    @prop({ type: () => Number, default: null })
    taxRegime: number | null

    @prop({ type: () => Boolean, default: true })
    showDempingWarning: boolean
}
