import { prop } from '@typegoose/typegoose';
import { TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export class StoreWAModel extends TimeStamps {
  @prop({ required: true })
  storeId: string;

  @prop()
  phoneNumber: string;

  @prop()
  isActive: boolean;
}