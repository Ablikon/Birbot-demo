import { Body, Controller, Post, Query, UseGuards, UsePipes, ValidationPipe, Get, Patch, Param, Req } from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard'
import { UserService } from './user.service'
import { UserId } from 'src/decorators/user-id.decorator'
import { UserReferralService } from './user-referral/user-referral.service'
import { ApiBody, ApiOperation } from '@nestjs/swagger'
import { UpdateUserNewFeatureDto } from './dto/new-feature.dto'
import { Message } from './dto/message.dto'
import { AcceptAgreementDto } from './dto/accept-agreement.dto'
import { Request } from 'express'

@Controller('profile')
export class UserController {
    constructor(
        private readonly userService: UserService,
        private readonly userReferral: UserReferralService,
    ) { }

    @Get('/')
    @UseGuards(JwtAuthGuard)
    async getProfileInfo(@UserId() userId: string) {
        return this.userService.getProfileInfo(userId)
    }

    @Get('/referral-code')
    @UseGuards(JwtAuthGuard)
    async getReferralCode(@UserId() userId: string) {
        return this.userReferral.getCodeByUserId(userId)
    }

    @Get('/referrals/:userId')
    // @UseGuards(JwtAuthGuard)
    async getReferrals(@Param('userId') userId: string ){
        return this.userReferral.getUserReferrals(userId)
    }

    @Post('/referrals/get-money')
    @UseGuards(JwtAuthGuard)
    async getMoney(@Body() dto: Message) {
        return this.userReferral.sendReferralMoneyBackMessage(dto.userId, dto.value)
    }


    @Patch('/')
    @UseGuards(JwtAuthGuard)
    async updateProfileInfo(@UserId() userId: string, @Body() body: { cid: string }) {
        return this.userService.updateProfileInfo(userId, body)
    }

    @Patch(':userId')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({
        summary: 'Обновить статус новой фичи и онбордига',
    })
    @ApiBody({
        type: UpdateUserNewFeatureDto,
        required: true,
    })
    async updateProduct(@Param('userId') UserId: string, @Body() dto: UpdateUserNewFeatureDto) {
        return this.userService.updateUserNewFeatures(UserId, dto)
    }

    @Get('/is-have-payments/:phoneNumber')
    @UseGuards(JwtAuthGuard)
    async isHavePayments(@Param('phoneNumber') phoneNumber: string) {
        return this.userService.isHavePayments(phoneNumber)
    }

    @Get('/agreement')
    @UseGuards(JwtAuthGuard)
    async getAgreement(@UserId() userId: string) {
        return this.userService.getAgreement(userId)
    }

    @Post('/agreement/accept')
    @UseGuards(JwtAuthGuard)
    async acceptAgreement(@UserId() userId: string, @Body() dto: AcceptAgreementDto, @Req() req: Request) {
        return this.userService.acceptUserAgreement(userId, dto, req)
    }
}
