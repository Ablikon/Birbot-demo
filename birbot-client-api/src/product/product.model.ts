/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

interface PriceRow {
    price: number
}

class CityData {
    @prop({ required: true, type: () => String })
    id: string

    @prop({ required: true, type: () => String })
    name: string

    @prop({ required: true, type: () => Number, default: 0 })
    minPrice: number

    @prop({ required: true, type: () => Object, default: {} })
    priceRow: PriceRow
}

class CityPrices {
    @prop({ required: true, type: () => String })
    cityId: string

    @prop({ required: true, type: () => Number, default: 0 })
    value: number
}

export interface ProductModel extends Base {}

export class ProductModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId })
    configId: Types.ObjectId

    @prop({ type: () => Types.ObjectId })
    storeId: Types.ObjectId

    @prop({ type: () => String, required: true })
    sku: string

    @prop({ type: () => String, required: true })
    name: string

    @prop({ type: () => Number, required: true })
    price: number | null

    @prop({ type: () => Number, default: 0 })
    availableMinPrice: number

    @prop({ type: () => Number, default: 999999999 })
    availableMaxPrice: number

    @prop({ type: () => Boolean, default: false })
    isUpdateEveryWeek: boolean

    @prop({ type: () => Boolean, default: false })
    isSetMinPrice: boolean

    @prop({ type: () => String })
    url: string

    @prop({ type: () => String, default: '' })
    brand: string

    @prop({ type: () => String, default: '' })
    category: string

    @prop({ type: () => String, default: '' })
    img: string

    @prop({ default: false })
    isDemping: boolean

    @prop({ default: false })
    isChanging: boolean

    @prop({ required: true, type: () => Object })
    masterProduct: any

    @prop({ type: () => Array, default: [] })
    cityData: CityData[]

    @prop({ type: () => Array, default: [] })
    cityPrices: CityPrices[]

    @prop({ type: () => Array, default: [] })
    newCityData: any[]

    @prop({ type: () => Boolean, default: true, required: true })
    isActive: boolean

    @prop({ type: () => Number, default: 0 })
    amount: number

    @prop({ type: () => Boolean, default: false })
    isAmountChanged: boolean

    @prop({ type: () => Boolean, default: false })
    isWithdrawFromSale: boolean

    @prop({ type: () => Number, default: 0 })
    place: number

    @prop({ type: () => Boolean, default: false })
    isMinus: boolean

    @prop({ type: () => Date, default: null })
    lastCheckedDate: Date

    @prop({ type: () => Number, default: 1 })
    dempingPrice: number

    @prop({ type: () => Boolean, default: true })
    isAutoRaise: boolean

    @prop({ type: () => Boolean, default: false })
    orderAutoAccept: boolean

    @prop({ type: () => Boolean, default: false })
    isDempingOnlyMainCity: boolean

    @prop({ type: () => Number, default: null })
    purchasePrice: number

    @prop({ type: () => String, default: '' })
    merchantId: string

    @prop({ type: () => Number, default: 24 })
    loanPeriod: number

    @prop({ type: () => Number, default: null })
    offersCount: number

    @prop({ type: () => Boolean, default: false })
    autoacceptOrder: boolean

    @prop({ type: () => Number, default: 10 })
    marginPercent: number

    @prop({ type: () => Number, default: 0 })
    weight: number

    @prop({ type: () => Boolean, default: false })
    isAuctionWinner: boolean

    @prop({ type: () => Number, default: null })
    kaspiCabinetPosition: number

    @prop({ type: () => Number, default: null })
    preOrderDays: number

    @prop({ type: () => Boolean, default: false })
    isPreOrder: boolean

    @prop({ type: () => Boolean, default: false })
    isBonusDemping: boolean

    @prop({ type: () => Number, default: 5 })
    bonus: number

    @prop({ type: () => Number, default: 60 })
    maxBonus: number

    @prop({ type: () => Number, default: 5 })
    minBonus: number
    
    @prop({ type: () => String, default: '' })
    productCampaignStatus: 'paused' | '' | 'Enabled'
}
