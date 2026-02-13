import { Module } from '@nestjs/common';
import { TypegooseModule } from 'nestjs-typegoose';
import { StoreWAModel } from './store-wa.model';
import { StoreWaService } from './store-wa.service';

@Module({
  imports: [
    TypegooseModule.forFeature([
      {
        typegooseClass: StoreWAModel,
        schemaOptions: {
          collection: 'store_wa',
        },
      },
    ]),
  ],
  providers: [StoreWaService],
  exports: [StoreWaService],
})
export class StoreWaModule {}