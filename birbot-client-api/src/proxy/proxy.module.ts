import { forwardRef, Module } from '@nestjs/common'
import { ProxyService } from './proxy.service'
import { ProxyController } from './proxy.controller'
import { TypegooseModule } from 'nestjs-typegoose'
import { ProxyModel } from './proxy.model'
import { ConfigModule } from '@nestjs/config'
import { UserModule } from 'src/user/user.module'
import { ActionModule } from 'src/action/action.module'

@Module({
    providers: [ProxyService],
    controllers: [ProxyController],
    exports: [ProxyService],
    imports: [
        TypegooseModule.forFeature(
            [
                {
                    typegooseClass: ProxyModel,
                    schemaOptions: {
                        collection: 'Proxy',
                    },
                },
            ],
            'tech'
        ),
        ConfigModule,
        forwardRef(() => UserModule),
        ActionModule,
    ],
})
export class ProxyModule {}
