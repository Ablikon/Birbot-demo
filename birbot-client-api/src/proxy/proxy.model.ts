import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export interface ProxyModel extends Base {}

export class ProxyModel extends TimeStamps {
    @prop({ required: true, type: () => Types.ObjectId })
    userId: Types.ObjectId

    @prop({ default: '', type: () => String })
    login: string

    @prop({ default: '', type: () => String })
    password: string

    @prop({ required: true, type: () => String })
    proxy: string

    @prop({ required: true, type: () => String })
    host: string

    @prop({ required: true, type: () => Number })
    port: number

    @prop({ type: () => Boolean, default: true })
    isActive: boolean

    @prop({ type: () => Number, default: 0, required: true })
    usedCount: number

    @prop({ type: () => String, default: 'MERCHANTCABINET' })
    type: string
}
