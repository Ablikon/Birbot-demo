/// <reference types="node" />
/// <reference types="node" />
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface OrderImageModel extends Base {
}
export declare class OrderImageModel extends TimeStamps {
    orderId: Types.ObjectId;
    imageBuffer: Buffer;
    fileName: string;
    size: number;
}
