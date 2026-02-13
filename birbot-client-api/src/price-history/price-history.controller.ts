import { Controller, Get, HttpCode, Param, UseGuards } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard'
import { UserId } from 'src/decorators/user-id.decorator'
import { PriceHistoryService } from './price-history.service'

@Controller('price-history')
@ApiTags('Price History')
export class PriceHistoryController {
    constructor(private readonly priceHistroyService: PriceHistoryService) {}

    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    @Get('/:storeId/:productId')
    async getPriceHistory(@Param('storeId') storeId: string, @Param('productId') productId: string, @UserId() userId: string) {
        return this.priceHistroyService.getPriceHistory(userId, storeId, productId)
    }
}
