import { BadRequestException, Body, Controller, HttpCode, Post, Req, UsePipes, ValidationPipe } from '@nestjs/common'
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Request } from 'express'
import { ActionService } from 'src/action/action.service'
import { AuthService } from './auth.service'
import { LoginDto } from './dto/login.dto'
import { RegistrationDto } from './dto/registration.dto'
import { ResetPasswordDto } from './dto/reset.dto'
import { SetPasswordDto } from './dto/setPassword.dto'
import { VerifyDto } from './dto/verify.dto'
import { INVALID_CAPTCHA_ERROR } from './auth.constants'

@Controller('auth')
@ApiTags('Authorization')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly actionService: ActionService) {}

    @UsePipes(new ValidationPipe())
    @HttpCode(201)
    @ApiBody({
        type: RegistrationDto,
        required: true,
    })
    @Post('/registration')
    @ApiOperation({
        summary: 'Регистрация',
    })
    async registration(@Body() dto: RegistrationDto) {
        return this.authService.registration(dto)
    }

    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Post('/login')
    @ApiOperation({
        summary: 'Авторизация',
    })
    @ApiBody({
        type: LoginDto,
        required: true,
    })
    async login(@Body() dto: LoginDto, @Req() req: Request) {
        return this.authService.login(dto, req)
    }

    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Post('/verify')
    @ApiOperation({
        summary: 'Верификация номера телефона',
    })
    @ApiBody({
        type: VerifyDto,
        required: true,
    })
    async verify(@Body() dto: VerifyDto, @Req() req: Request) {
        return this.authService.verify(dto, req)
    }

    // @Recaptcha({response: req => req.body.captchaToken})
    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Post('/reset')
    @ApiOperation({
        summary: 'Сбросить пароль',
    })
    @ApiBody({
        type: ResetPasswordDto,
        required: true,
    })
    async reset(@Body() dto: ResetPasswordDto, @Req() req: Request) {
        console.log(`RESET PASSWORD | ${new Date()}`)
        console.log(req)
        if(req.headers['user-agent'].startsWith('SaleScoutApp/1') ||
            req.headers['user-agent'] === 'okhttp/4.9.2'
        ){
            console.log('Mobile app')
        }
        else{
            if(!this.authService.verifyCaptcha(dto.captchaToken)){
                return new BadRequestException(INVALID_CAPTCHA_ERROR)
            }
        }
        // console.log(dto)
        // if(this.authService.verifyCaptcha(dto.captchaToken)){

        // }
        return this.authService.reset(dto)
    }

    @UsePipes(new ValidationPipe())
    @HttpCode(200)
    @Post('/set-password')
    @ApiOperation({
        summary: 'Установить новый пароль',
    })
    @ApiBody({
        type: SetPasswordDto,
        required: true,
    })
    async setPassword(@Body() dto: SetPasswordDto) {
        return this.authService.setPassword(dto)
    }
}
