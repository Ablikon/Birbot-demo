import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface StorePositionMetricsModel extends Base {}
export class StorePositionMetricsModel extends TimeStamps {
    @prop({ type: () => Number, required: true })
    firstPositionPercentageWithCompetitivePriceFloor: number

    @prop({ type: () => Number, required: true })
    nonFirstPositionPercentageDueToPriceLimit: number

    @prop({ type: () => Number, required: true })
    saleScoutClientFirstPlacePresenceRate: number
}
