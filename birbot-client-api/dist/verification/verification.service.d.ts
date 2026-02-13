export declare class VerificationService {
    sendVerificationCode(phone: string): Promise<any>;
    verifyCode(phone: string, code: string): Promise<boolean>;
    generateCode(length: number): string;
    recordAuthVerificationCode(code: string, phone: string): Promise<void>;
    recordResetVerificationCode(code: string, phone: string): Promise<void>;
    getByToken(token: string): Promise<any>;
}
