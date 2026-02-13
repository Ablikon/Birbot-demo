import { CreateActionDto } from './dto/create-action.dto';
export declare class ActionService {
    create(userId: string, dto: any): Promise<{
        success: boolean;
    }>;
    createNewAction(dto: CreateActionDto): Promise<{
        success: boolean;
    }>;
}
