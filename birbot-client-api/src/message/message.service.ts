import { Injectable } from '@nestjs/common';

@Injectable()
export class MessageService {
  async sendMessage(phoneNumber: string, message: string) {
    console.log('Message sent:', { phoneNumber, message });
    return { success: true };
  }
}