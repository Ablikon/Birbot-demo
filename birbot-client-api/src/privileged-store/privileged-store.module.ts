import { Module } from '@nestjs/common'
import { PrivilegedStoreService } from './privileged-store.service'

@Module({
    providers: [PrivilegedStoreService],
    exports: [PrivilegedStoreService],
})
export class PrivilegedStoreModule {}
