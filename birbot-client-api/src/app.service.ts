import { Injectable } from '@nestjs/common'

@Injectable()
export class AppService {
    async getMemoryUsage(): Promise<string> {
        return 'heapdump disabled in dev';
    }
}