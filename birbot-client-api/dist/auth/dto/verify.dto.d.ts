export declare class VerifyDto {
    code: string;
    phone: string;
    refCode?: string;
    clientInfo?: {
        timezone?: string;
        screen?: string;
    };
    fbp: string;
    fbc: string;
}
