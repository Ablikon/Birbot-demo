"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrivilegedStoreModule = void 0;
const common_1 = require("@nestjs/common");
const privileged_store_service_1 = require("./privileged-store.service");
let PrivilegedStoreModule = class PrivilegedStoreModule {
};
PrivilegedStoreModule = __decorate([
    (0, common_1.Module)({
        providers: [privileged_store_service_1.PrivilegedStoreService],
        exports: [privileged_store_service_1.PrivilegedStoreService],
    })
], PrivilegedStoreModule);
exports.PrivilegedStoreModule = PrivilegedStoreModule;
//# sourceMappingURL=privileged-store.module.js.map