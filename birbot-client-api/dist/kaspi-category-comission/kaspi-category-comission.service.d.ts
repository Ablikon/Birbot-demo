import { KaspiCategoryComissionModel } from './kaspi-category-comission.model';
import { ModelType } from '@typegoose/typegoose/lib/types';
export declare class KaspiCategoryComissionService {
    private readonly kaspiCategoryComissionModel;
    constructor(kaspiCategoryComissionModel: ModelType<KaspiCategoryComissionModel>);
    getCategoryByTitle(title: string, hasChild?: boolean): Promise<KaspiCategoryComissionModel | null>;
    getCategoryByCode(code: string, hasChild?: boolean): Promise<KaspiCategoryComissionModel | null>;
}
