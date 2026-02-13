"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const action_module_1 = require("../action/action.module");
const jwt_config_1 = require("../configs/jwt.config");
const store_wa_module_1 = require("../store-wa/store-wa.module");
const user_module_1 = require("../user/user.module");
const user_service_1 = require("../user/user.service");
const verification_module_1 = require("../verification/verification.module");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
let AuthModule = class AuthModule {
};
AuthModule = __decorate([
    (0, common_1.Module)({
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, jwt_strategy_1.JWTStrategy],
        imports: [
            user_module_1.UserModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule, user_module_1.UserModule],
                inject: [config_1.ConfigService, user_service_1.UserService],
                useFactory: jwt_config_1.getJWTConfig,
            }),
            passport_1.PassportModule,
            config_1.ConfigModule,
            verification_module_1.VerificationModule,
            action_module_1.ActionModule,
            store_wa_module_1.StoreWaModule,
        ],
    })
], AuthModule);
exports.AuthModule = AuthModule;
//# sourceMappingURL=auth.module.js.map