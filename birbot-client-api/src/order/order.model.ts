import { Types } from 'mongoose'
import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OrderModel extends Base {}
export class OrderModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true })
    storeId: Types.ObjectId

    @prop({ type: () => String, required: true })
    orderId: string

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

    @prop({ type: () => Number, default: 0 })
    deliveryCost: number

    @prop({ type: () => String, default: '' })
    deliveryMode: string

    @prop({ type: () => String, default: '' })
    town: string

    @prop({ type: () => String, required: true })
    orderCode: string

    @prop({ type: () => String, required: true })
    productId: string

    @prop({ type: () => String, default: '' })
    productName: string

    @prop({ type: () => String, required: true })
    productCode: string

    @prop({ type: () => Array, default: [] })
    products: any[]

    @prop({ type: () => Number, default: 0 })
    quantity: number

    @prop({ type: () => String, default: '' })
    state: string

    @prop({ type: () => String, default: '' })
    status: string

    @prop({ type: () => Date, required: true })
    creationDate: Date

    @prop({ type: () => Date, default: null })
    completedDate: Date | null

    @prop({ type: () => String, required: true })
    url: string

    @prop({ type: () => Object, default: null })
    category: {
        title: string
        code: string
    } | null

    @prop({ type: () => String, default: '' })
    addressDisplayName: string

    @prop({ type: () => String, default: '' })
    comment: string

    @prop({ type: () => Boolean, default: false })
    reviewsSent: boolean

    @prop({ type: () => Boolean, default: false })
    orderInfoSent: boolean

    @prop({ type: () => Boolean, default: false })
    taplinkSent: boolean

    @prop({ type: () => Boolean, default: false })
    fromSSTap: boolean
}
