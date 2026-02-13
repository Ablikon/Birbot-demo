import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface XmlUploadHistoryModel extends Base {
}
export declare class XmlUploadHistoryModel extends TimeStamps {
    storeId: Types.ObjectId;
    uploadStatus: number;
    uploadTimeDiff?: number | null;
    lastSuccessUploadTime: number;
    createdAt: Date;
}
