import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard'
import { CreateStoreCityDto } from './dto/create-store-city.dto'
import { UpdateProductCitiesDto } from './dto/update-product-cities.dto'
import { UpdateProductCityDto } from './dto/update-product-city.dto'
import { UpdateStoreCityDto } from './dto/update-store-city.dto'
import { StoreCityService } from './store-city.service'
import { CreateActionDto } from 'src/action/dto/create-action.dto'
import { ActionService } from 'src/action/action.service'

@Controller('store-city')
@ApiTags('Store City')
export class StoreCityController {
    constructor(
        private readonly actionService: ActionService,
        private readonly storeCityService: StoreCityService
    ) {}

    @Get('/:productId')
    @UseGuards(JwtAuthGuard)
    async getProductCities(@Param('productId') productId: string) {
        return this.storeCityService.getProductCities(productId)
    }

    @Post('/')
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe())
    async createStoreCity(@Body() dto: CreateStoreCityDto) {
        return this.storeCityService.createStoreCity(dto)
    }

    @Delete(':storeCityId')
    @UseGuards(JwtAuthGuard)
    async deleteStoreCity(@Param('storeCityId') storeCityId: string) {
        return this.storeCityService.deleteStoreCity(storeCityId)
    }

    @Patch('/product/:productCityId')
    @UsePipes(new ValidationPipe())
    @UseGuards(JwtAuthGuard)
    async updateProductCity(@Param('productCityId') productCityId: string, @Body() dto: UpdateProductCityDto) {
        return this.storeCityService.updateProductCity(productCityId, dto)
    }

    @Patch('/product')
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe())
    async updateProductCities(@Body() dto: UpdateProductCitiesDto[]) {
        return this.storeCityService.updateProductCities(dto)
    }

    @Post('/:storeCityId')
    @UsePipes(new ValidationPipe())
    @UseGuards(JwtAuthGuard)
    async updateStoreCityData(@Body() dto: UpdateStoreCityDto, @Param('storeCityId') storeCityId: string) {
        const newActionDto = new CreateActionDto()
        newActionDto.userId = dto.userId
        newActionDto.action = 'CHANGE_STORE_CITY_DATA'
        newActionDto.storeId = dto.storeId
        newActionDto.newData = {
            dto,
        }
        this.actionService.createNewAction(newActionDto)
        console.log(storeCityId)
        return this.storeCityService.updateStoreCityData(storeCityId, dto)
    }

    @Get(':storeId/store')
    @UseGuards(JwtAuthGuard)
    async getStoreCities(@Param('storeId') storeId: string) {
        return this.storeCityService.getStoreCities(storeId)
    }
}
