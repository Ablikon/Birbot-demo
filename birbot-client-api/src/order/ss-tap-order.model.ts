import { Types } from 'mongoose'
import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SSTapOrderModel extends Base {}
export class SSTapOrderModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true })
    storeId: Types.ObjectId

    @prop({ type: () => Number, default: 0 })
    totalPrice: number

    @prop({ type: () => String, default: '' })
    customerFirstName: string

    @prop({ type: () => String, default: '' })
    customerLastName: string

    @prop({ type: () => String, default: '' })
    customerPhone: string

    @prop({ type: () => String, default: '' })
    deliveryAddress: string

    @prop({ type: () => String, default: '' })
    state: string

    @prop({ type: () => Date, required: true })
    creationDate: Date

    @prop({ type: () => Date, default: null })
    completedDate: Date | null

    @prop({type: () => Array, default: []})
    products: {code: string, cost: number}[]
}
