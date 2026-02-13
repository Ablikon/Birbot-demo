import { forwardRef, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'
import { kaspiAPIController } from './kaspi-api.controller'
import { KaspiAPIService } from './kaspi-api.service'
import { PaymentModel } from 'src/payment/payment.model'
import { KaspiAPIPaymentsModel } from './kaspi-api.model'
import { PaymentModule } from 'src/payment/payment.module'
import { TariffModule } from 'src/tariff/tariff.module'

@Module({
    controllers: [kaspiAPIController],
    providers: [KaspiAPIService],
    imports: [

        TypegooseModule.forFeature(
            [
                {
                    typegooseClass: KaspiAPIPaymentsModel,
                    schemaOptions: {
                        collection: 'KaspiAPIPayments',
                    },
                },
            ],
        ),
        forwardRef(() => PaymentModule),
        forwardRef(() => TariffModule),

    ],
    exports: [KaspiAPIService],
})
export class KaspiAPIModule {}
