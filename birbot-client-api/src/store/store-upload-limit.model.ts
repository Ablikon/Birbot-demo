import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export interface KaspiStoreUploadLimitModel extends Base {}

export class KaspiStoreUploadLimitModel extends TimeStamps {
    @prop({ type: () => String, required: true, unique: true })
    merchantId: string

    @prop({ type: String })
    limitType: "OFFER" | "NEW"

    @prop({ type: Number })
    uploadedCount: number

    @prop({ type: Date, default: [] })
    expirationDate: Date

    @prop({ type: Boolean, default: [] })
    unlimited: boolean

    @prop({ type: Number, default: [] })
    maxCount: number

    @prop({ type: Date, default: [] })
    actualizedFromKaspiDate: Date

    @prop({ type: Boolean, default: [] })
    isUploading: boolean
}
