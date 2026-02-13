"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProxyModule = void 0;
const common_1 = require("@nestjs/common");
const proxy_service_1 = require("./proxy.service");
const proxy_controller_1 = require("./proxy.controller");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const proxy_model_1 = require("./proxy.model");
const config_1 = require("@nestjs/config");
const user_module_1 = require("../user/user.module");
const action_module_1 = require("../action/action.module");
let ProxyModule = class ProxyModule {
};
ProxyModule = __decorate([
    (0, common_1.Module)({
        providers: [proxy_service_1.ProxyService],
        controllers: [proxy_controller_1.ProxyController],
        exports: [proxy_service_1.ProxyService],
        imports: [
            nestjs_typegoose_1.TypegooseModule.forFeature([
                {
                    typegooseClass: proxy_model_1.ProxyModel,
                    schemaOptions: {
                        collection: 'Proxy',
                    },
                },
            ], 'tech'),
            config_1.ConfigModule,
            (0, common_1.forwardRef)(() => user_module_1.UserModule),
            action_module_1.ActionModule,
        ],
    })
], ProxyModule);
exports.ProxyModule = ProxyModule;
//# sourceMappingURL=proxy.module.js.map