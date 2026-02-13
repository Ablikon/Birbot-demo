import { modelOptions, prop } from '@typegoose/typegoose'
import { Types } from 'mongoose'

export enum KaspiStorePickupPointStatusEnum {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
}

@modelOptions({
    schemaOptions: {
        timestamps: true, // This will add createdAt and updatedAt fields
    },
})

export class KaspiStorePickupPointModel {
    @prop({ type: () => Types.ObjectId, required: true, ref: 'Store' })
    storeId?: Types.ObjectId

    @prop({ type: () => String, required: true })
    formattedAddress: string

    @prop({ type: () => String, required: true, enum: KaspiStorePickupPointStatusEnum })
    status: KaspiStorePickupPointStatusEnum

    @prop({ type: () => String, required: true })
    name: string

    @prop({ type: () => String, required: true })
    displayName: string

    @prop({ type: () => String, required: true })
    cityId: string

    @prop({ type: () => String, required: true })
    cityName: string

    @prop({ type: () => Boolean, required: true })
    available: boolean

    @prop({ type: () => Boolean, required: true })
    virtual: boolean

    @prop({ type: () => Boolean, required: true })
    warehouse: boolean

    
}
