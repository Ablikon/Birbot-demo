import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { Types } from 'mongoose';
export declare class KaspiProductAvailabilityOnPickupPointModel extends TimeStamps {
    productId: Types.ObjectId;
    storePickupPointId: Types.ObjectId;
    amount: number | null;
    preOrder: number;
    available: boolean;
}
