/* eslint-disable @typescript-eslint/no-empty-interface */
import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export interface UserModel extends Base {}

export class UserModel extends TimeStamps {
    @prop({ type: () => String, required: true, unique: true })
    email: string

    @prop({ type: () => String })
    name: string

    @prop({ type: () => String })
    surname: string

    @prop({ type: () => String, default: '' })
    passwordHash: string

    @prop({ type: () => Number, default: 1 })
    storeLimit: number

    @prop({ type: () => Number, default: 0 })
    leadId: number

    @prop({ type: () => Number, default: 0 })
    contactId: number

    @prop({ type: () => Boolean, default: false })
    isRef: boolean

    @prop({ type: () => Boolean, default: false })
    isBlocked: boolean

    @prop({ type: () => Types.ObjectId, default: null })
    referer: Types.ObjectId

    @prop({ type: () => Boolean, default: false })
    isShowAnalytics: boolean

    @prop({ type: () => Boolean, default: false })
    isShowMessage: boolean

    @prop({ type: () => String, default: null })
    cid: string

    @prop({ type: () => Boolean, default: false })
    topStoreStatistics: boolean

    @prop({ type: () => Date, default: null })
    acceptTokensAfterDate: Date | null

    @prop({ type: () => Number, default: 1 })
    analyticsManagersCount: number

    @prop({ type: () => Number, default: 0 })
    expressAnalyticsRequestCount: number

    @prop({ type: () => Boolean, default: false })
    isNew: boolean

    @prop({ type: () => Boolean, default: false })
    showNewFeature: boolean

    @prop({ type: () => Boolean, default: false })
    isPartcipiateInPaymentsAction
}
