import { forwardRef, Module } from '@nestjs/common'
import { TypegooseModule } from 'nestjs-typegoose'
import { UserModel } from './user.model'
import { UserService } from './user.service'
import { ConfigModule } from '@nestjs/config'
import { NotVerifiedUserModel } from './not-verified-user.model'
import { UserReferralModel } from './user-referral/user-referral.model'
import { UserReferralService } from './user-referral/user-referral.service'
import { UserController } from './user.controller'
import { UserCidHistoryModel } from './user-cid-history.model'
import { PaymentModel } from 'src/payment/payment.model'
import { ReferralPaymentModel } from 'src/payment/referral-payment.model'
import { StoreModel } from 'src/store/store.model'
import { UserAgreementModel } from './user-agreement.model'

@Module({
    imports: [
        TypegooseModule.forFeature(
            [
                {
                    typegooseClass: UserModel,
                    schemaOptions: {
                        collection: 'User',
                    },
                },
                {
                    typegooseClass: NotVerifiedUserModel,
                    schemaOptions: {
                        collection: 'NotVerifiedUser',
                    },
                },
                {
                    typegooseClass: UserReferralModel,
                    schemaOptions: {
                        collection: 'UserReferral',
                    },
                },
                {
                    typegooseClass: UserCidHistoryModel,
                    schemaOptions: {
                        collection: 'UserCidHistory',
                    },
                },
                {
                    typegooseClass: PaymentModel,
                    schemaOptions: {
                        collection: 'Payment',
                    },
                },
                {
                    typegooseClass: ReferralPaymentModel,
                    schemaOptions: {
                        collection: 'ReferralPayment'
                    }
                },
                {
                    typegooseClass: StoreModel,
                    schemaOptions: {
                        collection: 'Store',
                    },
                },
                {
                    typegooseClass: UserAgreementModel,
                    schemaOptions: {
                        collection: 'UserAcceptedAgreement',
                    },
                },
            ],
        
        ),
        ConfigModule,
      
    ],
    providers: [UserService, UserReferralService],
    exports: [UserService],
    controllers: [UserController],
})
export class UserModule {}
