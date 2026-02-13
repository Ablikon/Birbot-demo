import { BadRequestException, Body, Controller, Get, Param, Patch, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard'
import { UserId } from 'src/decorators/user-id.decorator'
import { UpdateStoreV2Dto } from './dto/update-store-v2.dto'
import { StoreV2Service } from './store-v2.service'
import { isNumberString } from 'class-validator'
import { StoreService } from './store.service'

@Controller('/v2/store')
@ApiTags('v2 Store')
export class StoreV2Controller {
    constructor(private readonly storeV2Service: StoreV2Service, private readonly storeService: StoreService) {}

    @Get('position-metrics')
    async getStorePositionMetrics(@Query('startDate') startTime: string, @Query('endDate') endTime: string) {
        if (!isNumberString(startTime) || !isNumberString(endTime)) {
            throw new BadRequestException()
        }

        return this.storeService.getStorePositionMetrics(new Date(parseInt(startTime)), new Date(parseInt(endTime)))
    }

    @Patch('/:storeId')
    @UseGuards(JwtAuthGuard)
    @UsePipes(
        new ValidationPipe({
            whitelist: true,
        })
    )
    async updateOne(@Body() dto: UpdateStoreV2Dto, @Param('storeId') storeId: string, @UserId() userId: string) {
        return this.storeV2Service.updateStoreFromController(storeId, userId, dto)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/kaspi/auth-check')
    async checkKaspiToken() {
        return this.storeV2Service.checkKaspiToken()
    }

    
}
