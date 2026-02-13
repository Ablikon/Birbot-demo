import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface MarketplaceCityModel extends Base {}

export class MarketplaceCityModel extends TimeStamps {
    @prop({ type: () => String, required: true })
    marketplaceKey: string

    @prop({ type: () => String, required: true })
    id: string

    @prop({ type: () => String, required: true })
    name: string
}
