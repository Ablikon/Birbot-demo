import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
export interface NotVerifiedUserModel extends Base {
}
export declare class NotVerifiedUserModel extends TimeStamps {
    phone: string;
    name: string;
    surname: string;
    token: string;
}
