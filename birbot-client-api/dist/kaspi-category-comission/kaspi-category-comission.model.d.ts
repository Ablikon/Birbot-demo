import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
export interface KaspiCategoryComissionModel extends Base {
}
export declare class KaspiCategoryComissionModel extends TimeStamps {
    comissionStart: number;
    comissionEnd: number;
    hasChild: boolean;
    id: string;
    level: number;
    mainCategoryId: number;
    mainCategoryTitle: string;
    parentId: number;
    parentTitle: string;
    title: string;
    code: string;
}
