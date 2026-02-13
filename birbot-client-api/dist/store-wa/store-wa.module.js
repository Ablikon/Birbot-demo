"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreWaModule = void 0;
const common_1 = require("@nestjs/common");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const store_wa_model_1 = require("./store-wa.model");
const store_wa_service_1 = require("./store-wa.service");
let StoreWaModule = class StoreWaModule {
};
StoreWaModule = __decorate([
    (0, common_1.Module)({
        imports: [
            nestjs_typegoose_1.TypegooseModule.forFeature([
                {
                    typegooseClass: store_wa_model_1.StoreWAModel,
                    schemaOptions: {
                        collection: 'store_wa',
                    },
                },
            ]),
        ],
        providers: [store_wa_service_1.StoreWaService],
        exports: [store_wa_service_1.StoreWaService],
    })
], StoreWaModule);
exports.StoreWaModule = StoreWaModule;
//# sourceMappingURL=store-wa.module.js.map