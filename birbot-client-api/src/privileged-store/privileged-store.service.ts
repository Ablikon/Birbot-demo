import { Injectable } from '@nestjs/common'

@Injectable()
export class PrivilegedStoreService {
    async isPrivileged(storeId: string): Promise<boolean> {
        return false
    }
}
