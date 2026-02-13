/// <reference types="node" />
/// <reference types="node" />
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface OrderProductEntryImageModel extends Base {
}
export declare class OrderProductEntryImageModel extends TimeStamps {
    orderProductEntryId: Types.ObjectId;
    imageBuffer: Buffer;
    fileName: string;
    size: number;
}
