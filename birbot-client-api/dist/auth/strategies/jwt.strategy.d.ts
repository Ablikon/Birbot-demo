import { ConfigService } from '@nestjs/config';
import { Strategy } from 'passport-jwt';
import { UserService } from 'src/user/user.service';
declare const JWTStrategy_base: new (...args: any[]) => Strategy;
export declare class JWTStrategy extends JWTStrategy_base {
    private readonly userService;
    constructor(configService: ConfigService, userService: UserService);
    validate({ _id, iat }: {
        _id: string;
        iat: number;
    }): Promise<string>;
}
export {};
