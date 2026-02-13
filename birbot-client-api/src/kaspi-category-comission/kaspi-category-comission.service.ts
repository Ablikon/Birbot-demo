import { Injectable } from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import { KaspiCategoryComissionModel } from './kaspi-category-comission.model'
import { ModelType } from '@typegoose/typegoose/lib/types'

@Injectable()
export class KaspiCategoryComissionService {
    constructor(
        @InjectModel(KaspiCategoryComissionModel) private readonly kaspiCategoryComissionModel: ModelType<KaspiCategoryComissionModel>
    ) {}

    public async getCategoryByTitle(title: string, hasChild?: boolean): Promise<KaspiCategoryComissionModel | null> {
        return this.kaspiCategoryComissionModel.findOne({ title, hasChild })
    }

    public async getCategoryByCode(code: string, hasChild?: boolean): Promise<KaspiCategoryComissionModel | null> {
        return this.kaspiCategoryComissionModel.findOne({ code, hasChild })
    }
}
