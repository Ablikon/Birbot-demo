"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.KaspiCategoryComissionModule = void 0;
const common_1 = require("@nestjs/common");
const kaspi_category_comission_service_1 = require("./kaspi-category-comission.service");
const nestjs_typegoose_1 = require("nestjs-typegoose");
const kaspi_category_comission_model_1 = require("./kaspi-category-comission.model");
let KaspiCategoryComissionModule = class KaspiCategoryComissionModule {
};
KaspiCategoryComissionModule = __decorate([
    (0, common_1.Module)({
        providers: [kaspi_category_comission_service_1.KaspiCategoryComissionService],
        imports: [
            nestjs_typegoose_1.TypegooseModule.forFeature([
                {
                    typegooseClass: kaspi_category_comission_model_1.KaspiCategoryComissionModel,
                    schemaOptions: {
                        collection: 'KaspiCategoryNewComission',
                    },
                },
            ]),
        ],
        exports: [kaspi_category_comission_service_1.KaspiCategoryComissionService],
    })
], KaspiCategoryComissionModule);
exports.KaspiCategoryComissionModule = KaspiCategoryComissionModule;
//# sourceMappingURL=kaspi-category-comission.module.js.map