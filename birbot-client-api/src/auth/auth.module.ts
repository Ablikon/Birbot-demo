import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ActionModule } from 'src/action/action.module'
import { getJWTConfig } from 'src/configs/jwt.config'
import { StoreWaModule } from 'src/store-wa/store-wa.module'
import { UserModule } from 'src/user/user.module'
import { UserService } from 'src/user/user.service'
import { VerificationModule } from 'src/verification/verification.module'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { JWTStrategy } from './strategies/jwt.strategy'

@Module({
    controllers: [AuthController],
    providers: [AuthService, JWTStrategy],
    imports: [
        UserModule,
        JwtModule.registerAsync({
            imports: [ConfigModule, UserModule],
            inject: [ConfigService, UserService],
            useFactory: getJWTConfig,
        }),
        PassportModule,
        ConfigModule,
       
        VerificationModule,
        ActionModule,
        StoreWaModule,
        
    ],
})
export class AuthModule {}
