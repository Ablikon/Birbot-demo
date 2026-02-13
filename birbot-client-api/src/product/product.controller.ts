import { Body, Controller, Delete, ForbiddenException, Get, HttpCode, Param, Patch, Post, Query, UseGuards, UsePipes } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard'
import { UserId } from 'src/decorators/user-id.decorator'
import { ProductService } from './product.service'
import { CreateActionDto } from 'src/action/dto/create-action.dto'
import { ActionService } from 'src/action/action.service'
import { ApproveProductDto } from './dto/approve-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { MassUpdateProductsDto } from './dto/mass-update-product'
import { UserService } from 'src/user/user.service'
import { ACCOUNT_WAS_BLOCKED_ERROR } from 'src/auth/auth.constants'
import { Product } from './product'
import { ProductDeliveryDurationDto, ProductDeliveryDurationManyDto } from './dto/product-delivery-duration.dto'

@Controller('product')
@ApiTags('Product')
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        private readonly product: Product,
        private readonly actionService: ActionService,
        private readonly userService: UserService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get(':storeId')
    @HttpCode(200)
    @ApiOperation({
        summary: 'Получить количество товаров по статусам',
    })
    async getProductCountsByStoreId(@Param('storeId') storeId: string, @UserId() userId: string) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'GET_PRODUCT_COUNT'
        newActionDto.storeId = storeId
        this.actionService.createNewAction(newActionDto)

        return await this.productService.getProductCount(storeId)
    }

    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    @Post(':storeId')
    @ApiQuery({
        name: 'q',
        required: false,
    })
    @ApiQuery({
        name: 'limit',
        required: false,
    })
    @ApiQuery({
        name: 'page',
        required: false,
    })
    @ApiQuery({
        name: 'filter',
        required: false,
    })
    @ApiQuery({
        name: 'sort',
        required: false
    })
    @ApiOperation({
        summary: 'Получить товары по статусам',
    })
    async getProductsByStoreId(
        @Query('limit') limit: string,
        @Query('page') page: string,
        @Param('storeId') storeId: string,
        @Query('q') q: string,
        @Query('filter') filter: string,
        @Query('sortBy') sortBy: string,
        @UserId() userId: string
    ) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const l = parseInt(limit) || 20
        const p = parseInt(page) || 1

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'GET_PRODUCTS_BY_STORE'
        newActionDto.storeId = storeId
        newActionDto.newData = {
            limit: l,
            page: p,
            query: q,
            filter,
            sortBy,
        }
        this.actionService.createNewAction(newActionDto)

        return this.productService.getProductsByStoreId(storeId, l, p, q, filter, sortBy)
    }

    @Get('for-mobile-app/:storeId')
    @UseGuards(JwtAuthGuard)
    async getProductsForMobileApp(@UserId() userId: string, @Param('storeId') storeId: string) {
        return await this.productService.getProductsForMobileApp(userId, storeId)
    }

    @Get('/get-cancels-metrics')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Получить метрику отмен с Kaspi API' })
    async getCancelsMetric(@Query('id') id: string, @UserId() userId: string) {
      const isBlocked = await this.userService.isBlocked(userId);
      if (isBlocked) {
        throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR);
      }
    
      if (!id) {
        throw new Error('id is required');
      }
    
      return await this.productService.getCancelsMetric(id);
    }
    
    


    @Get('product-by-id/:productId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Получить товар по айди',
    })
    async getProductById(@Param('productId') productId: string, @UserId() userId: string) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        return await this.productService.getProductById(productId)
    }

    @Patch(':productId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Обновить настройку товара',
    })
    @ApiBody({
        type: UpdateProductDto,
        required: true,
    })
    async updateProduct(@Param('productId') productId: string, @Body() dto: UpdateProductDto, @UserId() userId: string) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'UPDATE_PRODUCT'
        newActionDto.newData = {
            productId,
            ...dto,
        }
        await this.actionService.createNewAction(newActionDto)

        const result = await this.product.updateProduct(productId, dto);
        // console.log(result)
        return result;
    }

    @HttpCode(200)
    @Post('/:storeId/approve')
    @UseGuards(JwtAuthGuard)
    @UsePipes()
    @ApiOperation({
        summary: 'Выставить товар на продажу',
    })
    @ApiBody({
        type: ApproveProductDto,
        required: true,
    })
    async approve(@Param('storeId') storeId: string, @UserId() userId: string, @Body() dto: ApproveProductDto) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'SET_ACTIVE_PRODUCT'
        newActionDto.newData = dto
        newActionDto.storeId = storeId
        this.actionService.createNewAction(newActionDto)

        return this.productService.approve(storeId, dto)
    }

    @Post(':storeId/withdraw')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Снять товар с продажи',
    })
    @ApiBody({
        type: ApproveProductDto,
        required: true,
    })
    async withdrawFromSale(@Param('storeId') storeId: string, @UserId() userId: string, @Body() dto: ApproveProductDto) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'WITHDRAW_FROM_SALE'
        newActionDto.newData = {
            storeId,
            dto,
        }
        this.actionService.createNewAction(newActionDto)

        return this.productService.withdrawFromSale(dto.products, storeId)
    }

    @Patch(':storeId/mass')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Массовые действия',
    })
    @ApiBody({
        type: MassUpdateProductsDto,
        required: true,
    })
    async massUpdateProducts(@UserId() userId: string, @Param('storeId') storeId: string, @Body() dto: MassUpdateProductsDto) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.storeId = storeId
        newActionDto.action = 'MASS_UPDATE_PRODUCT'
        newActionDto.newData = {
            ...dto,
        }
        this.actionService.createNewAction(newActionDto)

        return this.productService.massUpdateProducts(userId, storeId, dto)
    }

    @Get(':storeId/delivery-duration')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Получить способы демпинга цен',
    })
    async getProductDeliveryDurations(@Param('storeId') storeId: string, @Query('sku') sku: string) {

        return this.productService.getProductDeliveryDuration(storeId, sku)
    }


    @Get(':storeId/products-requests')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Получить количество запросов на изменение цены по товарам',
    })
    async getProductsRequests(@Param('storeId') storeId: string) {

        return this.productService.getProductsRequests(storeId)
    }


    @Post(':storeId/delivery-duration')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Обновить способы демпинга цен',
    })
    @ApiBody({
        type: ProductDeliveryDurationDto,
        required: true,
    })
    async changeProductDeliveryDuration(@Param('storeId') storeId: string, @Body() dto: ProductDeliveryDurationDto) {

        return this.productService.changeProductDeliveryDuration(storeId, dto.sku, dto.deliveryDurations)
    }

    @Delete(':storeId/delivery-duration')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Удалить способы демпинга цен',
    })
    @ApiBody({
        type: ProductDeliveryDurationDto,
        required: true,
    })
    async deleteProductDeliveryDuration(@Param('storeId') storeId: string, @Query('sku') sku: string,) {

        return this.productService.deleteProductDeliveryDuration(storeId, sku)
    }


    @Post(':storeId/delivery-duration/many')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Обновить способы демпинга цен',
    })
    @ApiBody({
        type: ProductDeliveryDurationManyDto,
        required: true,
    })
    async changeManyProductDeliveryDuration(@Param('storeId') storeId: string, @Body() dto: ProductDeliveryDurationManyDto) {
        return this.productService.changeManyProductDeliveryDuration(storeId, dto.sku, dto.deliveryDurations)
    }

    @Get('bonus-history/:productId')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOperation({
        summary: 'Получить историю изменений бонусов для продукта',
    })
    @ApiQuery({
        name: 'limit',
        required: false,
        type: Number,
        description: 'Количество записей на странице (по умолчанию 50)',
    })
    @ApiQuery({
        name: 'page',
        required: false,
        type: Number,
        description: 'Номер страницы (по умолчанию 1)',
    })
    async getBonusChangeHistory(
        @Param('productId') productId: string,
        @UserId() userId: string,
        @Query('limit') limit?: number,
        @Query('page') page?: number
    ) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'GET_BONUS_CHANGE_HISTORY'
        this.actionService.createNewAction(newActionDto)

        return await this.productService.getBonusChangeHistory(
            productId,
            limit || 50,
            page || 1
        )
    }

    @Patch(':storeId/gold-link')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    @ApiOperation({
        summary: 'Обновить статус привязки товара к золоту',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                productId: { type: 'string' },
                isLinked: { type: 'boolean' },
            },
            required: ['productId', 'isLinked'],
        },
    })
    async updateGoldLink(
        @Param('storeId') storeId: string,
        @Body() body: { productId: string; isLinked: boolean },
        @UserId() userId: string
    ) {
        const isBlocked = await this.userService.isBlocked(userId)
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'UPDATE_GOLD_LINK_STATUS'
        newActionDto.storeId = storeId
        newActionDto.newData = {
            productId: body.productId,
            isLinked: body.isLinked,
        }
        this.actionService.createNewAction(newActionDto)

        return await this.productService.updateGoldLinkStatus(storeId, body.productId, body.isLinked)
    }
}
