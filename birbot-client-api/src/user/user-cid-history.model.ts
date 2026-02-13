/* eslint-disable @typescript-eslint/no-empty-interface */
import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'
import { Types } from 'mongoose'

export interface UserCidHistoryModel extends Base {}

export class UserCidHistoryModel extends TimeStamps {
    @prop({ type: () => Types.ObjectId, required: true })
    userId: Types.ObjectId

    @prop({ type: () => String, required: true })
    cid: string
}
