"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = void 0;
const common_1 = require("@nestjs/common");
let VerificationService = class VerificationService {
    async sendVerificationCode(phone) {
        console.log('[STUB] Verification code sent to:', phone);
        return { success: true, code: '123456' };
    }
    async verifyCode(phone, code) {
        console.log('[STUB] Verifying code:', { phone, code });
        return true;
    }
    generateCode(length) {
        const code = '123456';
        console.log('[STUB] Generated code, length:', length);
        return code;
    }
    async recordAuthVerificationCode(code, phone) {
        console.log('[STUB] Recorded auth verification code:', { phone, code });
    }
    async recordResetVerificationCode(code, phone) {
        console.log('[STUB] Recorded reset verification code:', { phone, code });
    }
    async getByToken(token) {
        console.log('[STUB] Get by token:', token);
        return null;
    }
};
VerificationService = __decorate([
    (0, common_1.Injectable)()
], VerificationService);
exports.VerificationService = VerificationService;
//# sourceMappingURL=verification.service.js.map