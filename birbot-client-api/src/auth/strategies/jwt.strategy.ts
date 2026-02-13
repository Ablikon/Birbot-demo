import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserService } from 'src/user/user.service'

@Injectable()
export class JWTStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService, private readonly userService: UserService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ingoreExpiration: true,
            secretOrKey: process.env.JWT_SECRET || '',
        })
    }

    async validate({ _id, iat }: { _id: string; iat: number }) {
        const user = await this.userService.findUserById(_id)

        if (!user) {
            throw new UnauthorizedException()
        }

        if (user.acceptTokensAfterDate && iat * 1000 <= user.acceptTokensAfterDate.getTime()) {
            throw new UnauthorizedException()
        }

        return _id
    }
}
