import { Body, Controller, Get, HttpCode, Param, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { KaspiAPIService } from './kaspi-api.service'
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard'

@Controller('kaspi-api')
@ApiTags('Kaspi-QR')
export class kaspiAPIController {
    constructor(private readonly kaspiAPIService: KaspiAPIService) { }

    @Post('/create-link')
    @HttpCode(200)
    @UsePipes(new ValidationPipe())
    @UseGuards(JwtAuthGuard)
    async createLink(@Body() dto: { externalId: string; amount: number, merchantId: string }, @Req() req: any) {
        const userId = req.user;
        return this.kaspiAPIService.createQrLink({ ...dto, userId });
    }

    @Post('/create-token')
    @HttpCode(200)
    @UsePipes(new ValidationPipe())
    @UseGuards(JwtAuthGuard)
    async createToken(@Body() dto: { externalId: string; amount: number, merchantId: string }, @Req() req: any) {
        const userId = req.user;
        return this.kaspiAPIService.createQrToken({ ...dto, userId });
    }

    @Get('/status/:paymentId')
    @HttpCode(200)
    @UsePipes(new ValidationPipe())
    @UseGuards(JwtAuthGuard)
    async getPaymentStatus(@Param('paymentId') paymentId: number, @Req() req: any) {
        const userId = req.user;
        return this.kaspiAPIService.getPaymentStatus(paymentId, userId);
    }

    @Post('/refund')
    @HttpCode(200)
    @UsePipes(new ValidationPipe())
    @UseGuards(JwtAuthGuard)
    async reufndPurchase(@Body() dto: { paymentId: number; amount: number, merchantId: string }, @Req() req: any) {
        const userId = req.user;
        return this.kaspiAPIService.refundPurchase({...dto, userId});
    }
}
