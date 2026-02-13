import { prop } from '@typegoose/typegoose'
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface KaspiCategoryComissionModel extends Base {}
export class KaspiCategoryComissionModel extends TimeStamps {
    @prop({ type: () => Number, required: true })
    comissionStart: number

    @prop({ type: () => Number, required: true })
    comissionEnd: number

    @prop({ type: () => Boolean, required: true })
    hasChild: boolean

    @prop({ type: () => String, required: true })
    id: string

    @prop({ type: () => Number, required: true })
    level: number

    @prop({ type: () => Number, required: true })
    mainCategoryId: number

    @prop({ type: () => String, required: true })
    mainCategoryTitle: string

    @prop({ type: () => Number, required: true })
    parentId: number

    @prop({ type: () => String, required: true })
    parentTitle: string

    @prop({ type: () => String, required: true })
    title: string

    @prop({ type: () => String, required: true })
    code: string
}
