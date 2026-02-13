import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OrderProductEntryImageModel extends Base {}

export class OrderProductEntryImageModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true })
    orderProductEntryId: Types.ObjectId

    @prop({ type: () => Buffer, required: true })
    imageBuffer: Buffer

    @prop({ type: () => String, required: true, unique: true })
    fileName: string

    @prop({ type: () => Number, default: 0 })
    size: number
}
