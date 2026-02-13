import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface UserCidHistoryModel extends Base {
}
export declare class UserCidHistoryModel extends TimeStamps {
    userId: Types.ObjectId;
    cid: string;
}
