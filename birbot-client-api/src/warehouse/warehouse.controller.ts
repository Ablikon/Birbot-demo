import {
    Body,
    Controller,
    ForbiddenException,
    Get,
    HttpCode,
    MaxFileSizeValidator,
    NotFoundException,
    Param,
    ParseFilePipe,
    Post,
    Query,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { Response } from 'express'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard'
import { WarehouseService } from './warehouse.service'
import { existsSync } from 'fs'
import { CreateActionDto } from 'src/action/dto/create-action.dto'
import { ActionService } from 'src/action/action.service'
import { UserId } from 'src/decorators/user-id.decorator'
import { UserService } from 'src/user/user.service'
import { ACCOUNT_WAS_BLOCKED_ERROR } from 'src/auth/auth.constants'
import { isNumber } from 'class-validator'

@Controller('warehouse')
@ApiTags('Warehouse')
export class WarehouseController {
    constructor(
        private readonly warehouseService: WarehouseService,
        private readonly actionService: ActionService,
        private readonly userService: UserService
    ) {}

    @Post('/kaspi/price-list/:storeId')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('price-list'))
    @HttpCode(200)
    async uploadKaspiPriceList(
        @UploadedFile()
        file: Express.Multer.File,
        @Param('storeId') storeId: string,
        @UserId() userId: string
    ) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'UPLOAD_KASPI_PRICE_LIST'
        newActionDto.storeId = storeId
        newActionDto.newData = {}
        this.actionService.createNewAction(newActionDto)

        return this.warehouseService.uploadPriceList(file, storeId)
    }

    @Get('/kaspi/price-list/:storeId/history')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    async getKaspiPriceListHistory(
        @Param('storeId') storeId: string, 
        @UserId() userId: string, 
        @Query('page') p: string,
        @Query('limit') l: string
    ) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'UPLOAD_KASPI_PRICE_LIST'
        newActionDto.storeId = storeId
        newActionDto.newData = {}
        this.actionService.createNewAction(newActionDto)

        let page = 1
        if (isNumber(parseInt(p))) {
            page = parseInt(p)
        }

        let limit = 20
        if (isNumber(parseInt(l))) {
            const parsedLimit = parseInt(l)
            if (parsedLimit === 20 || parsedLimit === 50 || parsedLimit === 100) {
                limit = parsedLimit
            }
        }

        return this.warehouseService.getKaspiPriceListHistory(storeId, page, limit)
    }

    @Get('/kaspi/price-list/:storeId/history/:historyId')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    async getKaspiPriceListHistoryById(@Param('storeId') storeId: string, @Param('historyId') historyId: string, @UserId() userId: string) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'UPLOAD_KASPI_PRICE_LIST'
        newActionDto.storeId = storeId
        newActionDto.newData = {}
        this.actionService.createNewAction(newActionDto)

        return this.warehouseService.getKaspiPriceListHistoryById(storeId, historyId)
    }

    @Get('/kaspi/price-list/:storeId/history/:historyId/product-update-history')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    async getProductUpdateHistories(
        @Param('storeId') storeId: string,
        @Param('historyId') historyId: string,
        @UserId() userId: string,
        @Query('page') page: string,
        @Query('filter') filter: string,
        @Query('query') query: string
    ) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'UPLOAD_KASPI_PRICE_LIST'
        newActionDto.storeId = storeId
        newActionDto.newData = {}
        this.actionService.createNewAction(newActionDto)

        return this.warehouseService.getProductUpdateHistories(storeId, historyId, parseInt(page), filter, query)
    }

    @Post('example/:storeId')
    @HttpCode(201)
    @UseGuards(JwtAuthGuard)
    async generateExample(@Param('storeId') storeId: string, @Body() dto: {isActive?: boolean, isDemping: boolean}, @UserId() userId: string) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'GENERATE_PRICE_LIST_EXAMPLE'
        newActionDto.storeId = storeId
        newActionDto.newData = {}
        console.log("Creating new actions")
        await this.actionService.createNewAction(newActionDto)
        console.log("Created")
        return this.warehouseService.generateExample(storeId, dto)
    }

    @Get('example/last/:storeId')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async getLastExample(@Param('storeId') storeId: string, @UserId() userId: string) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'GENERATE_PRICE_LIST_EXAMPLE'
        newActionDto.storeId = storeId
        newActionDto.newData = {}
        this.actionService.createNewAction(newActionDto)

        return this.warehouseService.getLastPriceListExample(storeId)
    }

    @Get('example/:id')
    @HttpCode(200)
    async getExample(@Res() res: Response, @Param('id') id: string) {
        const priceListExample = await this.warehouseService.getPriceListExampleById(id)

        const { path } = priceListExample

        // const path = await this.warehouseService.getExample(storeId);

        if (!existsSync(path)) {
            throw new NotFoundException()
        }

        res.download(path)
    }
}
