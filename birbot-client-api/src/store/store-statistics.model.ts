import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export interface StoreStatisticsModel extends Base {}

export class StoreStatisticsModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true, unique: true })
    storeId: Types.ObjectId

    @prop({ type: Array, default: [] })
    topSellingProducts: []

    @prop({ type: Array, default: [] })
    topPoorlySellingProducts: []

    @prop({ type: Array, default: [] })
    topMarginProducts: []

    @prop({ type: Array, default: [] })
    topLowMarginProducts: []

    @prop({ type: Array, default: [] })
    topLowSellingCities: []

    @prop({ type: Array, default: [] })
    topSellingCities: []

    @prop({ type: Array, default: [] })
    topHighlyCompetitiveProducts: []

    @prop({ type: () => Number, default: 0 })
    todayProfit: number

    @prop({ type: () => Number, default: 0 })
    yesterdayProfit: number

    @prop({ type: () => Number, default: 0 })
    weekProfit: number

    @prop({ type: () => Number, default: 0 })
    monthProfit: number

    @prop({ type: () => Number, default: 0 })
    rangeDataProfit: number
}
