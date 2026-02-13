import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

export interface NotVerifiedUserModel extends Base {}

export class NotVerifiedUserModel extends TimeStamps {
    @prop({ type: () => String, required: true })
    phone: string

    @prop({ type: () => String, required: true })
    name: string

    @prop({ type: () => String, required: false, default: "" })
    surname: string

    @prop({ type: () => String, required: true })
    token: string
}
