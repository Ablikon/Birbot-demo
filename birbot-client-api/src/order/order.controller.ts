import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    HttpException,
    HttpStatus,
    NotFoundException,
    Param,
    Patch,
    Post,
    Query,
    Req,
    Res,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common'
import { ApiBody, ApiTags } from '@nestjs/swagger'
import { ActionService } from 'src/action/action.service'
import { CreateActionDto } from 'src/action/dto/create-action.dto'
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard'
import { UserId } from 'src/decorators/user-id.decorator'
import { OrderService } from './order.service'
import { Request, Response } from 'express'
import { FileInterceptor } from '@nestjs/platform-express'
import { path } from 'app-root-path'
import { ensureDir } from 'fs-extra'
import { unlinkSync, writeFileSync } from 'fs'
import { isNumberString } from 'class-validator'
import { UpdateOrderDto } from './dto/update-order.dto'
import { VerifyOrderRecievingDto } from 'src/store/dto/verify-order-recieving.dto'

@Controller('order')
@ApiTags('Order')
export class OrderController {
    constructor(private readonly orderService: OrderService, private readonly actionService: ActionService) {}

    @Get('stats-last-24-hours')
    async getStatisticsLast24Hours() {
        return this.orderService.getOrdersStattisticsLast24Hours()
    }

    @Get('stats-last-month')
    async getStatisticsLastMonth() {
        return this.orderService.getOrdersStattisticsLastMonth()
    }

    @Get(':storeId/statuses-report')
    @UseGuards(new JwtAuthGuard())
    async getStatusesReport(@Param('storeId') storeId: string) {
        return this.orderService.getStatusesReport(storeId)
    }
    @Get('/:storeId/first-order-date')
    async getFirstOrderDate(@Param('storeId') storeId: string): Promise<{ firstOrderDate: Date | null }> {
        const date = await this.orderService.getFirstOrderDate(storeId)
        return { firstOrderDate: date }
    }

    @Get('stats')
    async stats() {
        const result = await this.orderService.getOrderStatisctics(0, 'site')

        return {
            count: result.today,
            sum: result.todayTotalSum,
        }
    }

    @Get('/:orderCode/details')
    async getOrderByCode(@Param('orderCode') orderCode: string, @Req() req: Request) {
        const token = (req.headers.authorization || '').replace('Bearer ', '')

        return this.orderService.getOrderByCode(token, orderCode)
    }

    @Get('orderlist')
    async getOrdersList(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Req() req: Request
    ) {
        const token = (req.headers.authorization || '').replace('Bearer ', '')
        return this.orderService.getOrdersList(token, {
            page,
            limit,
            startDate,
            endDate,
        })
    }

    @Get('/:storeId/store-cities')
    @UseGuards(JwtAuthGuard)
    public async getStorePickupCities(@Param('storeId') storeId: string) {
        return this.orderService.getStorePickupCities(storeId)
    }

    @Get('/:storeId/orders-count')
    @UseGuards(JwtAuthGuard)
    public async getStoreOrdersCount(@Param('storeId') storeId: string) {
        return this.orderService.getStoreOrdersCount(storeId)
    }

    @Get('/:storeId/order-stats')
    @UseGuards(JwtAuthGuard)
    async getOrderStatsByStoreId(
        @Param('storeId') storeId: string,
        @Query('filter') filter: string,
        @Query('startDate') startDate: Date,
        @Query('endDate') endDate: Date,
        @UserId() userId: string
    ) {
        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'GET_ORDERS_BY_STORE_ID'
        newActionDto.storeId = storeId
        newActionDto.newData = {
            filter,
        }
        this.actionService.createNewAction(newActionDto)

        return this.orderService.getOrderStatsByStoreId(storeId, filter, startDate, endDate)
    }

    @Post('/:storeId/:orderCode/order-entries')
    @UseGuards(JwtAuthGuard)
    @HttpCode(200)
    public async saveOrderEntries(@Param('orderCode') orderCode: string, @Param('storeId') storeId: string, @Body() orderEntries: any[]) {
        return this.orderService.saveOrderEntries(storeId, orderCode, orderEntries)
    }

    @Get('/order-entry-image/:fileName')
    public async getOrderEntryImage(@Param('fileName') fileName: string, @Res() res: Response) {
        const image = await this.orderService.getOrderEntryImage(fileName)
        if (!image) {
            throw new NotFoundException()
        }

        const fullFolderPath = `${path}/uploads/order-entry-image`
        const fullFilePath = `${fullFolderPath}/${image.fileName}`

        await ensureDir(fullFolderPath)

        writeFileSync(fullFilePath, image.imageBuffer)
        await this.sleep(200)

        res.sendFile(fullFilePath)

        await this.sleep(5000)

        try {
            unlinkSync(fullFilePath)
        } catch (e) {
            console.log('[^]' + ' order.controller ' + ' | ' + new Date() + ' | ' + '\n' + e)
        }
    }

    @Get('/order-image/:fileName')
    public async getOrderImage(@Param('fileName') fileName: string, @Res() res: Response) {
        const image = await this.orderService.getOrderImage(fileName)
        if (!image) {
            throw new NotFoundException()
        }

        const fullFolderPath = `${path}/uploads/order-image`
        const fullFilePath = `${fullFolderPath}/${image.fileName}`

        await ensureDir(fullFolderPath)

        writeFileSync(fullFilePath, image.imageBuffer)
        await this.sleep(200)

        res.sendFile(fullFilePath)

        await this.sleep(5000)

        try {
            unlinkSync(fullFilePath)
        } catch (e) {
            console.log('[^]' + ' order.controller ' + ' | ' + new Date() + ' | ' + '\n' + e)
        }
    }

    @Delete('/order-entry-image/:orderEntryImageId')
    @UseGuards(JwtAuthGuard)
    public async deleteOrderEntryImage(@Param('orderEntryImageId') orderEntryImageId: string) {
        return this.orderService.deleteOrderEntryImage(orderEntryImageId)
    }

    @Delete('/order-image/:orderEntryImageId')
    @UseGuards(JwtAuthGuard)
    public async deleteOrderImage(@Param('orderEntryImageId') orderEntryImageId: string) {
        return this.orderService.deleteOrderImage(orderEntryImageId)
    }

    @Post('/:storeId/:orderCode/:productCode/order-entry-image')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('image'))
    public async saveOrderEntryImage(
        @UploadedFile()
        file: Express.Multer.File,
        @Param('orderCode') orderCode: string,
        @Param('storeId') storeId: string,
        @Param('productCode') productCode: string
    ) {
        return this.orderService.saveOrderEntryImage(storeId, orderCode, productCode, file)
    }

    @Post('/:storeId/:orderCode/order-image')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('image'))
    public async saveOrderImage(
        @UploadedFile()
        file: Express.Multer.File,
        @Param('orderCode') orderCode: string,
        @Param('storeId') storeId: string
    ) {
        return this.orderService.saveOrderImage(storeId, orderCode, file)
    }

    @Get('/:orderCode/order-entries')
    @UseGuards(JwtAuthGuard)
    public async getOrderEntries(@Param('orderCode') orderCode: string) {
        return this.orderService.getOrderEntries(orderCode)
    }

    @Get('/:storeId/:state')
    @UseGuards(JwtAuthGuard)
    public async getStoreOrders(
        @Param('storeId') storeId: string,
        @Param('state') state: string,
        @Query('q') q: string,
        @Query('page') page: string,
        @Query('limit') limit: string,
        @Query('town') town: string,
        @Query('dateFrom') dateFrom: string,
        @Query('dateTo') dateTo: string
    ) {
        return this.orderService.getStoreOrders({
            state,
            storeId,
            page: isNumberString(page) ? parseInt(page) : 1,
            limit: isNumberString(limit) ? parseInt(limit) : 20,
            query: q,
            town: town ? town : null,
            dateFrom: dateFrom,
            dateTo: dateTo,
        })
    }

    @Post('/accept-all-orders/:storeId/:state')
    @UseGuards(JwtAuthGuard)
    public async acceptAllOrders(@Param('storeId') storeId: string, @Query('town') town: string) {
        return this.orderService.acceptAllOrders(storeId, town ? town : null)
    }

    @Post('/accept-decline-order/:storeId/:state')
    @UseGuards(JwtAuthGuard)
    public async acceptOrder(
        @Param('storeId') storeId: string,
        @Body('orderId') orderId: string,
        @Body('orderCode') orderCode: string,
        @Body('accept') accept: boolean,
        @Body('cancelReason') cancelReason: string
    ) {
        try {
            const response = await this.orderService.acceptOrDeclineOrder(accept, orderId, orderCode, storeId, null, null, cancelReason)
            return response
        } catch (error) {
            if (error.response) {
                const { status, data } = error.response
                throw new HttpException(data, status)
            } else {
                throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }
    }

    @Post('/order-issuing/:storeId')
    @UseGuards(JwtAuthGuard)
    public async orderIssuing(
        @Param('storeId') storeId: string,
        @Body('orderId') orderId: string,
        @Body('securityCode') securityCode: number | null,
        @Body('sendCode') sendCode: boolean
    ) {
        try {
            const response = await this.orderService.orderIssuing(sendCode, orderId, securityCode, storeId, null)
            return response
        } catch (error) {
            if (error.response) {
                const { status, data } = error.response
                throw new HttpException(data, status)
            } else {
                throw new HttpException('Internal Server Error', HttpStatus.INTERNAL_SERVER_ERROR)
            }
        }
    }

    @Post('generate-invoices/:storeId')
    @UseGuards(JwtAuthGuard)
    @ApiBody({
        type: [String],
        required: true,
    })
    public async generateInvoices(@Param('storeId') storeId: string, @Body() dto: string[]) {
        return this.orderService.generateInvoices(storeId, dto)
    }

    @Post('get-invoices/:orderId/:printerType')
    @UseGuards(JwtAuthGuard)
    public async getInvoices(
        @Param('orderId') storeId: string,
        @Param('printerType') printerType: string,
        @Body() dto: string[],
        @Res() res: Response
    ) {
        return this.orderService.getInvoices(storeId, printerType, dto, res)
    }

    @Get('/:productId/orders')
    @UseGuards(JwtAuthGuard)
    async getProductOrders(@Param('productId') productId: string, @UserId() userId: string) {
        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'GET_ORDERS_BY_PRODUCT_ID'
        newActionDto.newData = {
            productId,
        }
        this.actionService.createNewAction(newActionDto)

        return this.orderService.getProductOrders(productId)
    }

    @Get('/:storeId/orders-history/:productId')
    @UseGuards(JwtAuthGuard)
    async getProductOrdersHistory(
        @Param('storeId') storeId: string,
        @Param('productId') productId: string,
        @Query('filterFromDate') filterFromDate: string,
        @Query('filterToDate') filterToDate: string
    ) {
        // const newActionDto = new CreateActionDto()
        // newActionDto.userId = userId
        // newActionDto.action = 'GET_ORDERS_BY_PRODUCT_ID'
        // newActionDto.newData = {
        //     productId,
        // }
        // this.actionService.createNewAction(newActionDto)

        return this.orderService.getOrdersHistoryByProductSku(storeId, productId, filterFromDate, filterToDate)
    }

    async sleep(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }

    @Patch(':orderCode')
    @UseGuards(JwtAuthGuard)
    async updateOrder(@Param('orderCode') orderCode: string, @Body() dto: UpdateOrderDto, @UserId() userId: string) {
        return this.orderService.updateOrder(userId, orderCode, dto)
    }

    @Get('/get-excel/:storeId/:state')
    @UseGuards(JwtAuthGuard)
    public async getExcel(
        @Param('storeId') storeId: string,
        @Param('state') state: string,
        @Query('cityId') cityId: string,
        @Query('filterFromDate') filterFromDate: string,
        @Query('filterToDate') filterToDate: string,
        @Res() res: Response
    ) {
        return await this.orderService.getExcel(res, storeId, filterFromDate, filterToDate, cityId, state)
    }
    // @Get('/:storeId/refunds/:state')
    // @UseGuards(JwtAuthGuard)
    // async getProductRefunds(@Param('storeId') storeId: string, @Param('state') state: string) {
    //     return this.orderService.getStoreRefundsByState(storeId, state)
    // }

    @Get('/refunds/:storeId/:state')
    @UseGuards(JwtAuthGuard)
    public async getStoreRefunds(
        @Param('storeId') storeId: string,
        @Param('state') state: string,
        @Query('query') query: string,
        @Query('page') page: string,
        @Query('limit') limit: string,
        @Query('town') town: string
    ) {
        return this.orderService.getStoreRefunds({
            state,
            storeId,
            page: isNumberString(page) ? parseInt(page) : 1,
            limit: isNumberString(limit) ? parseInt(limit) : 20,
            query,
            town: town ? town : null,
        })
    }

    @Get('/refunds-count/:storeId')
    @UseGuards(JwtAuthGuard)
    public async getStoreRefundsCount(@Param('storeId') storeId: string) {
        console.log('test')
        return this.orderService.getStoreRefundsCount(storeId)
    }

    @Get('/refund/:applicationNumber/order-entries')
    @UseGuards(JwtAuthGuard)
    public async getRefundEntries(@Param('applicationNumber') applicationNumber: string) {
        return this.orderService.getOrderEntries(applicationNumber)
    }

    @Post('/phone/send/:storeId/:orderId')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async sendStoreCode(@Param('storeId') storeId: string, @Param('orderId') orderId: string, @UserId() userId: string) {
        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'SEND_ORDER_PIN_CODE'
        this.actionService.createNewAction(newActionDto)

        return this.orderService.sendOrderPinCode(storeId, orderId)
    }

    @Post('/phone/verify')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    async verifyPhoneNumber(@Body() dto: VerifyOrderRecievingDto, @UserId() userId: string) {
        const newActionDto = new CreateActionDto()
        newActionDto.userId = userId
        newActionDto.action = 'VERIFY_ORDER_CODE'
        newActionDto.newData = {
            dto,
        }
        this.actionService.createNewAction(newActionDto)

        return this.orderService.verifyPhoneNumber(dto)
    }

    @Post('/complete-order/:orderId')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    public async completeOrder(@Param('orderId') orderId: string) {
        console.log('Order complete')
        return this.orderService.completeOrder(orderId)
    }

    @Get('/ss-tap/orders-count/:storeId')
    @HttpCode(200)
    @UseGuards(JwtAuthGuard)
    public async getSSOrdersCount(@Param('storeId') storeId: string) {
        // console.log("Getting orders count")
        // console.log(storeId)
        return this.orderService.getOrdersCount(storeId)
    }

    @Get('/ss-tap/:storeId/:state')
    @UseGuards(JwtAuthGuard)
    public async getStoreSSOrders(
        @Param('storeId') storeId: string,
        @Param('state') state: string,
        @Query('page') page: string,
        @Query('limit') limit: string,
        @Query('town') town: string,
        @Query('dateFrom') dateFrom: string,
        @Query('dateTo') dateTo: string
    ) {
        return this.orderService.getStoreSSOrders({
            state,
            storeId,
            page: isNumberString(page) ? parseInt(page) : 1,
            limit: isNumberString(limit) ? parseInt(limit) : 20,
            town: town ? town : null,
            dateFrom: dateFrom,
            dateTo: dateTo,
        })
    }
}
