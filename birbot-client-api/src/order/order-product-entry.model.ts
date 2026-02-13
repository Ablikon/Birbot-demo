import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface OrderProductEntryModel extends Base {}

export class OrderProductEntryModel extends TimeStamps {
    @prop({ type: () => String, required: true })
    orderId: string

    @prop({ type: () => String, required: true })
    productName: string

    @prop({ type: () => String, required: true })
    deliveryCost: string

    @prop({ type: () => String, required: true })
    orderCode: string

    @prop({ type: () => String, required: true })
    productCode: string

    @prop({ type: () => String, required: true })
    productId: string

    @prop({ type: () => Number, required: true })
    quantity: number

    @prop({ type: () => Number, required: true })
    totalPrice: number

    @prop({ type: () => Number, required: true })
    basePrice: number

    @prop({ type: () => Object, required: true })
    category: {
        code: string
        name: string
    }

    @prop({ type: () => Number, required: true })
    weight: number

    @prop({ type: () => String, default: '' })
    comment: string

    @prop({ type: () => String, default: '' })
    barCode: string
}
