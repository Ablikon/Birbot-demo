import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface ProxyModel extends Base {
}
export declare class ProxyModel extends TimeStamps {
    userId: Types.ObjectId;
    login: string;
    password: string;
    proxy: string;
    host: string;
    port: number;
    isActive: boolean;
    usedCount: number;
    type: string;
}
