import { UpdateStoreV2Dto } from './dto/update-store-v2.dto';
import { StoreV2Service } from './store-v2.service';
import { StoreService } from './store.service';
export declare class StoreV2Controller {
    private readonly storeV2Service;
    private readonly storeService;
    constructor(storeV2Service: StoreV2Service, storeService: StoreService);
    getStorePositionMetrics(startTime: string, endTime: string): Promise<any[]>;
    updateOne(dto: UpdateStoreV2Dto, storeId: string, userId: string): Promise<void>;
    checkKaspiToken(): Promise<boolean>;
}
