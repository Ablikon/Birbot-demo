import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
    UsePipes,
    ValidationPipe,
    Res,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { ActionService } from 'src/action/action.service'
import { CreateActionDto } from 'src/action/dto/create-action.dto'
import { ACCOUNT_WAS_BLOCKED_ERROR } from 'src/auth/auth.constants'
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard'
import { UserId } from 'src/decorators/user-id.decorator'
import { UserService } from 'src/user/user.service'
import { CreateStorePhoneDto } from './dto/create-store-phone.dto'
import { CreateStoreDto } from './dto/create-store.dto'
import { SetStartOrStopDto } from './dto/set-start-or-stop.dto'
import { StartStopStoreDto } from './dto/start-stop-store.dto'
import { UpdateApiTokenDto } from './dto/update-api-token.dto'
import { UpdateDempingCityIdDto } from './dto/update-demping-city-id.dto'
import { UpdateStoreCredentialsDto } from './dto/update-store-credentials.dto'
import { UpdateStorePhoneDto } from './dto/update-store-phone.dto'
import { VerifyExistingStorePhoneDto, VerifyNewStorePhoneDto } from './dto/verify-store-phone.dto'
import { StoreV2Service } from './store-v2.service'
import { STORE_NOT_FOUND_ERROR } from './store.constants'
import { StoreService } from './store.service'
import { ReAuthStoreByPhone } from './dto/reAuthStoreByPhone.dto'
import { Response } from 'express'
import { UpdateStoreSlugDto } from './dto/update-store-slug.dto'
import { SetIsDempingOnLoanPeriod } from './dto/set-is-demping-on-loan-period'
import { UpdateStoreTaxRegimeDto } from './dto/update-store-tax-regime.dto'; 

@Controller('store')
@ApiTags('Store')
export class StoreController {
    constructor(
        private readonly storeService: StoreService,
        private readonly storeV2Service: StoreV2Service,
        private readonly actionService: ActionService,
        private readonly userService: UserService
    ) {}

    @Post('/:storeId/demping-on-loan-period')
    @UseGuards(JwtAuthGuard)
    async setIsDempingOnLoan(@Param('storeId') storeId: string, @Body() dto: SetIsDempingOnLoanPeriod) {
        console.log(storeId, dto);
        return this.storeService.setIsDempingOnLoanPeriod(storeId, dto)
    }

    @Get('/show-ny-discount')
    @UseGuards(JwtAuthGuard)
    async showNYDiscount(@UserId() userId: string) {
        return this.storeService.showNYDiscount(userId)
    }

    @Post('/:storeId/launch-stop')
    @UseGuards(JwtAuthGuard)
    async setStartOrStop(@Param('storeId') storeId: string, @Body() dto: SetStartOrStopDto) {
        return this.storeService.setStartOrStop(storeId, dto)
    }

    @Get('/')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async getStores(@UserId() id: string, @UserId() userId: string) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'GET_STORE_LIST'
        this.actionService.createNewAction(newActionDto)

        return this.storeService.getStoresByUserIdForClient(id)
    }

    @Get('/:storeId')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async getStore(@Param('storeId') storeId: string, @UserId() userId: string) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.storeId = storeId
        newActionDto.action = 'GET_STORE'
        this.actionService.createNewAction(newActionDto)

        const owner = await this.storeV2Service.getStoreOwner(storeId)
        if (owner !== userId) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const response = await this.storeService.getStoreByIdForClient(storeId)
        const { orderStatusExpireDate, ...rest } = response
        return rest
    }

    // @Get('/s/:storeId')
    // @HttpCode(200)
    // @UseGuards(JwtAuthGuard)
    // async getStoreInfo(
    //   @Param('storeId') storeId: string,
    //   @UserId() userId: string,
    // ) {
    //   const isBlocked = await this.userService.isBlocked(userId);
    //   if (isBlocked) {
    //     throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR);
    //   }

    //   const newActionDto = new CreateActionDto();
    //   newActionDto.userId = userId;
    //   newActionDto.action = 'GET_STORE_FULL_INFO';
    //   newActionDto.storeId = storeId;
    //   this.actionService.createNewAction(newActionDto);

    //   const owner = await this.storeV2Service.getStoreOwner(storeId);
    //   if (owner !== userId) {
    //     throw new NotFoundException(STORE_NOT_FOUND_ERROR);
    //   }

    //   return this.storeService.getStoreById(storeId);
    // }

    @Get('/:storeId/warehouse')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async getStorePickupPoints(@UserId() userId: string, @Param('storeId') storeId: string) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.storeId = storeId
        newActionDto.action = 'GET_STORE_WAREHOUSE'
        this.actionService.createNewAction(newActionDto)

        return this.storeService.getStorePickupPoints(storeId)
    }

    @Get('/statistics/:storeId')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async getStoreStatistics(@Param('storeId') storeId: string, @Query('filter') filter: string, @UserId() userId: string) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'GET_STORE_STATISTICS'
        newActionDto.storeId = storeId
        newActionDto.newData = {
            filter,
        }
        this.actionService.createNewAction(newActionDto)

        const owner = await this.storeV2Service.getStoreOwner(storeId)
        if (owner !== userId) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        return this.storeService.getStoreCabinetStatistics(storeId, filter)
    }

    @Post('/test')
    @HttpCode(201)
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Создать тестовый магазин с демо-товарами' })
    async createTestStore(@UserId() id: string) {
        return await this.storeService.createTestStore(id)
    }

    @Post('/')
    @HttpCode(201)
    @UseGuards(JwtAuthGuard)
    async createStore(@Body() dto: CreateStoreDto, @UserId() id: string) {
        const isBlocked = await this.userService.isBlocked(id)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = id
        newActionDto.action = 'CREATE_STORE'
        newActionDto.newData = {
            dto,
        }
        this.actionService.createNewAction(newActionDto)

        return await this.storeService.createStore(dto, id)
    }

    @Post('/phone')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async createStoreByPhone(@Body() dto: CreateStorePhoneDto, @UserId() userId: string, @Res({ passthrough: true }) res: Response) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'SEND_PIN_CODE'
        newActionDto.newData = {
            dto,
        }
        this.actionService.createNewAction(newActionDto)

        return this.storeService.createStorePhone(dto, userId)
    }

    @Post('/phone/send/:storeId')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async sendStoreCode(@Param('storeId') storeId: string, @UserId() userId: string) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'SEND_STORE_PIN_CODE'
        this.actionService.createNewAction(newActionDto)

        return this.storeService.sendStorePinCode(storeId)
    }

    @Post('/phone/verify')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async verifyPhoneNumber(@Body() dto: VerifyNewStorePhoneDto, @UserId() userId: string) {
        // КРИТИЧЕСКИЙ ЛОГ - должен быть виден ПЕРВЫМ
        console.error('[^]' + ' store.controller verifyPhoneNumber START' + ' | ' + new Date() + ' | ' + `userId: ${userId}, token: ${dto.token ? 'есть' : 'нет'}, pin: ${dto.pin ? 'есть' : 'нет'}`)
        console.log('[^]' + ' store.controller verifyPhoneNumber START' + ' | ' + new Date() + ' | ' + `userId: ${userId}, token: ${dto.token ? 'есть' : 'нет'}, pin: ${dto.pin ? 'есть' : 'нет'}`)
        
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            console.error('[^]' + ' store.controller verifyPhoneNumber BLOCKED' + ' | ' + new Date() + ' | ' + `userId: ${userId}`)
            console.log('[^]' + ' store.controller verifyPhoneNumber BLOCKED' + ' | ' + new Date() + ' | ' + `userId: ${userId}`)
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'VERIFY_CODE'
        newActionDto.newData = {
            dto,
        }
        this.actionService.createNewAction(newActionDto)

        console.error('[^]' + ' store.controller verifyPhoneNumber CALLING SERVICE' + ' | ' + new Date() + ' | ' + `userId: ${userId}`)
        console.log('[^]' + ' store.controller verifyPhoneNumber CALLING SERVICE' + ' | ' + new Date() + ' | ' + `userId: ${userId}`)
        
        let result
        try {
            result = await this.storeService.verifyPhoneNumber(dto, userId)
        } catch (error: any) {
            console.error('[^]' + ' store.controller verifyPhoneNumber SERVICE_ERROR' + ' | ' + new Date() + ' | ' + 
                `userId: ${userId}, error: ${error?.message || 'unknown'}, statusCode: ${error?.status || 'нет'}`)
            throw error
        }
        
        console.error('[^]' + ' store.controller verifyPhoneNumber SUCCESS' + ' | ' + new Date() + ' | ' + `userId: ${userId}, storeId: ${result._id}`)
        console.log('[^]' + ' store.controller verifyPhoneNumber SUCCESS' + ' | ' + new Date() + ' | ' + `userId: ${userId}, storeId: ${result._id}`)
        return result
    }

    @Post('/phone-re-auth')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async reAuthStoreByPhone(@Body() dto: ReAuthStoreByPhone, @UserId() userId: string) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'SEND_PIN_CODE'
        newActionDto.newData = {
            dto,
        }
        this.actionService.createNewAction(newActionDto)

        return this.storeService.reAuthStoreByPhone(dto)
    }

    @Post('/phone/re-verify')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async reVerifyPhoneNumber(@Body() dto: VerifyExistingStorePhoneDto, @UserId() userId: string) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'VERIFY_CODE'
        newActionDto.newData = {
            dto,
        }
        this.actionService.createNewAction(newActionDto)

        return this.storeService.reVerifyPhoneNumber(dto)
    }

    @Post('/start-stop/:storeId')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async updateStartOrStop(@Param('storeId') storeId: string, @UserId() userId: string, @Body() dto: StartStopStoreDto) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'STORE_START_STOP'
        newActionDto.storeId = storeId
        newActionDto.newData = {
            dto,
        }
        this.actionService.createNewAction(newActionDto)

        const owner = await this.storeV2Service.getStoreOwner(storeId)
        if (owner !== userId) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        return this.storeService.updateStartOrStop(dto, storeId, userId)
    }

    @Patch('/credentials/:storeId')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    @UsePipes(new ValidationPipe())
    async updateKaspiCredentials(@Param('storeId') storeId: string, @UserId() userId: string, @Body() dto: UpdateStoreCredentialsDto) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'SET_KASPI_CREDENTIALS'
        newActionDto.storeId = storeId
        newActionDto.newData = {
            dto,
        }
        this.actionService.createNewAction(newActionDto)

        const owner = await this.storeV2Service.getStoreOwner(storeId)
        if (owner !== userId) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        return await this.storeService.updateKaspiCredentials(userId, storeId, dto)
    }

    // @Patch('/demping/city/id/:storeId')
    // @HttpCode(200)
    // @UseGuards(JwtAuthGuard)
    // async updateDempingCityId(@Param('storeId') storeId: string, @UserId() userId: string, @Body() dto: UpdateDempingCityIdDto) {
    //     const isBlocked = await this.userService.isBlocked(userId)
    //     if (isBlocked) {
    //         throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
    //     }

    //     const newActionDto = new CreateActionDto()
    //     newActionDto.userId = userId
    //     newActionDto.action = 'CHANGE_MAIN_CITY_ID'
    //     newActionDto.storeId = storeId
    //     newActionDto.newData = {
    //         dto,
    //     }
    //     this.actionService.createNewAction(newActionDto)

    //     const owner = await this.storeV2Service.getStoreOwner(storeId)
    //     if (owner !== userId) {
    //         throw new NotFoundException(STORE_NOT_FOUND_ERROR)
    //     }

    //     return this.storeService.updateDempingCityId(userId, storeId, dto)
    // }

    @Post('update-main-city/:storeId')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async updateMainCity(@Param('storeId') storeId: string, @Body() dto: UpdateDempingCityIdDto) {
        const isBlocked = await this.userService.isBlocked(dto.userId.toString())
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const owner = await this.storeV2Service.getStoreOwner(storeId)
        if (owner !== dto.userId.toString()) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = dto.userId
        newActionDto.action = 'CHANGE_MAIN_CITY'
        newActionDto.storeId = storeId
        newActionDto.newData = {
            dto,
        }
        this.actionService.createNewAction(newActionDto)

        return this.storeService.updateMainCity(dto.userId.toString(), storeId, dto)
    }


    
    @Patch('update-main-city-data/:storeId')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async updateMainCityData(@Param('storeId') storeId: string, @Body() dto: UpdateDempingCityIdDto) {
        const isBlocked = await this.userService.isBlocked(dto.userId.toString())
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }
        
        const owner = await this.storeV2Service.getStoreOwner(storeId)
        if (owner !== dto.userId.toString()) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }
        
        const newActionDto = new CreateActionDto()
        newActionDto.userId = dto.userId
        newActionDto.action = 'UPDATE_MAIN_CITY_DATA'
        newActionDto.storeId = storeId
        newActionDto.newData = {
            dto,
        }
        this.actionService.createNewAction(newActionDto)


        return this.storeService.updateMainCityData(dto.userId.toString(), storeId, dto)
    }


    @Patch('/token/:storeId')
    @UsePipes(new ValidationPipe())
    @HttpCode(204)
    @UseGuards(JwtAuthGuard)
    async updateApiToken(@Param('storeId') storeId: string, @Body() dto: UpdateApiTokenDto, @UserId() userId: string) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'SET_STORE_TOKEN'
        newActionDto.storeId = storeId
        newActionDto.newData = {
            dto,
        }
        this.actionService.createNewAction(newActionDto)

        const owner = await this.storeV2Service.getStoreOwner(storeId)
        if (owner !== userId) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        return this.storeService.updateApiToken(storeId, dto)
    }

    @Patch(':storeId/phone')
    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async updatePhoneNumber(@Body() dto: UpdateStorePhoneDto, @Param('storeId') storeId: string, @UserId() userId: string) {
        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'UPDATE_PHONE_NUMBER'
        newActionDto.storeId = storeId
        newActionDto.newData = {
            dto,
        }
        this.actionService.createNewAction(newActionDto)

        return this.storeService.updateStorePhoneNumber(userId, storeId, dto)
    }

    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    @Post(':storeId/load-products')
    @ApiOperation({
        summary: 'Загрузить все товары с маркетплейса',
    })
    async loadFromKaspi(@UserId() userId: string, @Param('storeId') storeId: string) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'LOAD_PRODUCTS_FROM_KASPI'
        newActionDto.storeId = storeId
        this.actionService.createNewAction(newActionDto)

        return this.storeService.loadProductsFromKaspi(userId, storeId)
    }

    @UseGuards(JwtAuthGuard)
    @Get(':storeId/load-products')
    @ApiOperation({
        summary: 'Получить все действие системы',
    })
    async getLoadProductsLastMessage(@Param('storeId') storeId: string) {
        return this.storeService.getLoadProductsLastMessage(storeId)
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':storeId/load-products')
    @ApiOperation({
        summary: 'Получить все действие системы',
    })
    async deleteLoadProductsLastMessage(@Param('storeId') storeId: string) {
        return this.storeService.deleteLoadProductsLastMessage(storeId)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/is-auth/:storeId')
    async isAuthorized(@Param('storeId') storeId: string, @UserId() userId: string) {
        return this.storeService.isAuthorized(userId, storeId)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:storeId/stats/general')
    async getGeneralStats(
        @Query('filter') filter: string,
        @Param('storeId') storeId: string,
        @Query('startDate') startDate?: Date,
        @Query('endDate') endDate?: Date
    ) {
        return this.storeService.getGeneralStats(storeId, filter, startDate, endDate)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:storeId/stats/profit')
    async getProfit(
        @Query('filter') filter: string,
        @Param('storeId') storeId: string,
        @Query('startDate') startDate: Date,
        @Query('endDate') endDate: Date
    ) {
        return this.storeService.getProfit(storeId, filter, startDate, endDate)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:storeId/stats/top-products')
    async getTopProducts(@Query('filter') filter: string, @Param('storeId') storeId: string) {
        return this.storeService.getTopProducts(storeId, filter)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:storeId/stats/top-margin-products')
    async getTopMarginProducts(@Param('storeId') storeId: string) {
        return this.storeService.getTopMarginProducts(storeId)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:storeId/stats/top-low-margin-products')
    async getTopLowMarginProducts(@Param('storeId') storeId: string) {
        return this.storeService.getTopLowMarginProducts(storeId)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:storeId/stats/chart')
    async getChart(
        @Param('storeId') storeId: string,
        @Query('filter') filter: string,
        @Query('startDate') startDate: Date,
        @Query('endDate') endDate: Date
    ) {
        return this.storeService.getChart(storeId, filter, startDate, endDate)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:storeId/stats/excel')
    async getPriceListExcel(@Param('storeId') storeId: string, @Query('filter') filter: string, @Res() res: Response) {
        return this.storeService.getDashboardExcel(storeId, filter, res)
    }

    @UseGuards(JwtAuthGuard)
    @Patch('/:storeId/slug')
    async updateStpreSlug(@Body() dto: UpdateStoreSlugDto, @Param('storeId') storeId: string) {
        return this.storeService.updateStoreSlug(storeId, dto)
    }
    
    @Patch(':storeId/taxRegime')
  @UseGuards(JwtAuthGuard) // Assuming you use guards like in your example
  async updateStoreTaxRegime(
    @Body() dto: UpdateStoreTaxRegimeDto, 
    @Param('storeId') storeId: string
  ) {
    return this.storeService.updateStoreTaxRegime(storeId, dto.taxRegime);
  }
    

    @UseGuards(JwtAuthGuard)
    @Get('/:storeId/limit')
    async getStoreSlug(@Param('storeId') storeId: string) {
        return this.storeService.getStoreUploadLimit(storeId)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/:storeId/next-xml-time')
    async getNextXmlTime(@Param('storeId') storeId: string) {
        return this.storeService.getTimeWhenNextXmlUpload(storeId)
    }

    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    @Post(':storeId/load-orders')
    @ApiOperation({
        summary:"Загрузить все заказы с маркетплейса"
    })
    async loadOrdersFromKaspi(@UserId() userId: string, @Param('storeId') storeId: string){
        const isBlocked = await this.userService.isBlocked(userId);
        if(isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }
        
        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'LOAD_ORDERS_FROM_KASPI'
        newActionDto.storeId = storeId
        this.actionService.createNewAction(newActionDto)
        return this.storeService.loadOrdersFromKaspi(userId,storeId)
    }

    @UseGuards(JwtAuthGuard)
    @Get(':storeId/load-orders')
    @ApiOperation({
        summary: 'Получить все действие системы',
    })
    async getLoadOrdersLastMessage(@Param('storeId') storeId: string) {
        return this.storeService.getLoadOrdersLastMessage(storeId)
    }
    
    @UseGuards(JwtAuthGuard)
    @Delete(':storeId/load-orders')
    @ApiOperation({
        summary: 'Получить все действие системы',
    })
    async deleteLoadOrdersLastMessage(@Param('storeId') storeId: string) {
        return this.storeService.deleteLoadOrdersLastMessage(storeId)
    }
}
