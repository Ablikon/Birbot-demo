import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard'
import { CityService } from './city.service'

@Controller('city')
export class CityController {
    constructor(private readonly cityService: CityService) {}

    @UseGuards(JwtAuthGuard)
    @Get(':marketplaceKey')
    public async getCities(@Param('marketplaceKey') marketplaceKey: string) {
        return this.cityService.getCities(marketplaceKey)
    }
}
