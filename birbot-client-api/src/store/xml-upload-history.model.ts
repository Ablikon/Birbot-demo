import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export interface XmlUploadHistoryModel extends Base {}

export class XmlUploadHistoryModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true })
    storeId: Types.ObjectId

    @prop({ type: () => Number, required: true })
    uploadStatus: number

    @prop({ type: () => Number, default: null })
    uploadTimeDiff?: number | null

    @prop({ type: () => Number, default: null })
    lastSuccessUploadTime: number

    @prop({ type: () => Date, default: null })
    createdAt: Date
}
