import { Injectable } from '@nestjs/common';
import { CreateActionDto } from './dto/create-action.dto';

@Injectable()
export class ActionService {
  async create(userId: string, dto: any) {
    console.log('Action created:', { userId, ...dto });
    return { success: true };
  }

  async createNewAction(dto: CreateActionDto) {
    console.log('Action created:', dto);
    return { success: true };
  }
}