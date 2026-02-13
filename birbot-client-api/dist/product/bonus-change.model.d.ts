import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export interface BonusChangeModel extends Base {
}
export declare class BonusChangeModel extends TimeStamps {
    sku: string;
    productId: Types.ObjectId;
    storeId: Types.ObjectId;
    storeName: string;
    changeType: 'bonus' | 'maxBonus' | 'minBonus' | 'isBonusDemping';
    oldBonusValue: number | null;
    newBonusValue: number | null;
    oldBooleanValue: boolean | null;
    newBooleanValue: boolean | null;
    changeDate: Date;
    changeMethod: 'MANUAL' | 'AUTO' | 'API';
    changedBy: string | null;
}
