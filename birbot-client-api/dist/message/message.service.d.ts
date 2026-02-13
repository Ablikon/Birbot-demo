export declare class MessageService {
    sendMessage(phoneNumber: string, message: string): Promise<{
        success: boolean;
    }>;
}
