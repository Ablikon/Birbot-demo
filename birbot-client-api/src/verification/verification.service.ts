import { Injectable } from '@nestjs/common';

@Injectable()
export class VerificationService {
  async sendVerificationCode(phone: string): Promise<any> {
    console.log('[STUB] Verification code sent to:', phone);
    return { success: true, code: '123456' };
  }

  async verifyCode(phone: string, code: string): Promise<boolean> {
    console.log('[STUB] Verifying code:', { phone, code });
    return true;
  }

  generateCode(length: number): string {
    const code = '123456';
    console.log('[STUB] Generated code, length:', length);
    return code;
  }

  async recordAuthVerificationCode(code: string, phone: string): Promise<void> {
    console.log('[STUB] Recorded auth verification code:', { phone, code });
  }

  async recordResetVerificationCode(code: string, phone: string): Promise<void> {
    console.log('[STUB] Recorded reset verification code:', { phone, code });
  }

  async getByToken(token: string): Promise<any> {
    console.log('[STUB] Get by token:', token);
    return null;
  }
}