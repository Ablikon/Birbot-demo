export type KaspiTmpPayload = {
    cookie: string;
    userAgent: string;
    phone: string;
    marketplaceId: string;
    sessionId?: string;
};
export declare function createKaspiToken(data: KaspiTmpPayload, userId: string, ttlMs?: number): string;
export declare function verifyKaspiToken<T extends Record<string, any> = any>(token: string, userId?: string): T;
