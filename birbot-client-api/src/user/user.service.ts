/* eslint-disable no-var */
/* eslint-disable prefer-const */
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { ModelType, DocumentType } from '@typegoose/typegoose/lib/types'
import { genSalt, hash } from 'bcryptjs'
import { Types } from 'mongoose'
import { InjectModel } from 'nestjs-typegoose'
import { USER_ALREADY_EXISTS_ERROR } from 'src/auth/auth.constants'
import { RegistrationDto } from 'src/auth/dto/registration.dto'
import { NotVerifiedUserModel } from './not-verified-user.model'
import { UserModel } from './user.model'
import { isValidObjectId } from 'mongoose'
import { UserReferralService } from './user-referral/user-referral.service'
import { CronJob } from 'cron'
import { UserCidHistoryModel } from './user-cid-history.model'
import { UpdateUserNewFeatureDto } from './dto/new-feature.dto'
import { PaymentModel } from 'src/payment/payment.model'
import { StoreModel } from 'src/store/store.model'
import { UserAgreementModel } from './user-agreement.model'
import { AcceptAgreementDto } from './dto/accept-agreement.dto'
import { Request } from 'express'

@Injectable()
export class UserService {
    constructor(
        @InjectModel(UserModel) private readonly userModel: ModelType<UserModel>,
        @InjectModel(StoreModel) private readonly storeModel: ModelType<StoreModel>,
      
        @InjectModel(NotVerifiedUserModel)
        private readonly notVerifiedUserModel: ModelType<NotVerifiedUserModel>,
        @InjectModel(UserCidHistoryModel)
        private readonly userCidHistoryModel: ModelType<UserCidHistoryModel>,
        @InjectModel(UserAgreementModel)
        private readonly userAgreementModel: ModelType<UserAgreementModel>,
        private readonly userReferralService: UserReferralService,
       
    ) {}

    async launchCrons() {
        // new CronJob('* * * * *', this.sendAnalyticsMessage).start()
    }

    async getTodayUsers() {
        return await this.userModel.find({
            createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
            },
        })
    }

    public async getExpressAnalyticsRequestCount(userId: string) {
        if (!isValidObjectId(userId)) {
            return 0
        }

        const user = await this.userModel.findOne({ _id: userId }).select({ expressAnalyticsRequestCount: 1 })

        return user?.expressAnalyticsRequestCount || 0
    }

    public async decreaseExpressAnalyticsRequestCount(userId: string) {
        if (!isValidObjectId(userId)) {
            return 0
        }

        const user = await this.userModel.findOne({ _id: userId }).select({ expressAnalyticsRequestCount: 1 })

        await this.userModel.updateOne(
            {
                _id: user._id,
            },
            {
                expressAnalyticsRequestCount: user.expressAnalyticsRequestCount - 1,
            }
        )
    }

    async getNotVerifiedUser(phone: string) {
        return await this.notVerifiedUserModel
            .findOne({
                phone,
            })
            .sort({
                _id: -1,
            })
    }

    async saveNotVerifiedUserModel(dto: RegistrationDto) {
        const newUser = await new this.notVerifiedUserModel({
            phone: dto.email,
            name: dto.name,
            surname:  dto.surname,
            token: this.getRandomToken(100),
        }).save()

        return newUser
    }

    private getRandomToken(length = 50) {
        var a = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890'.split('')
        var b = []
        for (var i = 0; i < length; i++) {
            var j = (Math.random() * (a.length - 1)).toFixed(0)
            b[i] = a[j]
        }
        return b.join('')
    }

    async getNotVerifiedUserByToken(token: string) {
        return await this.notVerifiedUserModel.findOne({ token })
    }

    async getAllUsers() {
        return await this.userModel.find({})
    }

    async getAllTodayUsers() {
        return await this.userModel.find({
            createdAt: {
                $gte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate()),
            },
        })
    }

    async clearNotAllowerUsersByPhone(phone: string) {
        await this.notVerifiedUserModel.deleteMany({ phone })
    }

    async setPassword(phone: string, password: string, invalidateOldTokens: boolean = true) {
        const user = await this.userModel.findOne({ email: phone })

        if (!user) {
            throw new NotFoundException()
        }

        const salt = await genSalt(10)

        const updateData: any = {
            passwordHash: await hash(password, salt),
        }

        // Инвалидируем старые токены только при сбросе пароля, НЕ при первой установке (регистрации)
        if (invalidateOldTokens) {
            updateData.acceptTokensAfterDate = new Date()
        }

        await this.userModel.updateOne(
            {
                _id: user._id,
            },
            updateData
        )

        return {
            _id: user._id,
        }
    }

    async deleteUser(userId: string) {
        await this.userModel.deleteOne({ _id: userId })

        return {
            userId,
        }
    }

    async findUserByEmail(email: string): Promise<DocumentType<UserModel>> | null {
        return this.userModel.findOne({ email }).exec()
    }

    async createUser(dto: RegistrationDto, leadId = 0, contactId = 0, facebook : { fbc?: string, fbp?: string}) {
        const oldUser = await this.userModel.findOne({ email: dto.email })

        if (oldUser) {
            throw new BadRequestException(USER_ALREADY_EXISTS_ERROR)
        }

        let referer = null
        if (dto.refCode) {
            referer = await this.userReferralService.getUserIdByCode(dto.refCode)
        }

        const newUser = new this.userModel({
            email: dto.email,
            passwordHash: '',
            name: dto.name,
            surname: dto.surname,
            leadId,
            contactId,
            isVerify: true,
            referer,
            acceptTokensAfterDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
            isNew: true,
            showNewFeature: false,
        })

        await newUser.save()
        
        const { fbp, fbc } = facebook

       

        try {
            await this.userReferralService.generateCode(newUser._id.toString())
        } catch (e) {
            console.log('[^]' + ' user.sarvice ' + ' | ' + new Date() + ' | ' + '\n'+e);
        }

        delete newUser.passwordHash
        delete newUser.referer

        return newUser
    }

    async updateIsRef(userId: string, value: boolean) {
        await this.userModel.updateOne(
            {
                _id: userId,
            },
            {
                isRef: value,
            }
        )
    }

    async updateLeadIds(userId: string, leadId = 0, contactId = 0) {
        await this.userModel.updateOne(
            {
                _id: userId,
            },
            {
                leadId,
                contactId,
            }
        )
    }

    async findUserById(id: string): Promise<DocumentType<UserModel>> | null {
        return this.userModel.findOne(
            {
                _id: new Types.ObjectId(id),
            },
            {
                createdAt: 1,
                email: 1,
                expireDate: 1,
                invitedBy: 1,
                storeLimit: 1,
                name: 1,
                referralCode: 1,
                surname: 1,
                leadId: 1,
                contactId: 1,
                cookie: 1,
                isShowAnalytics: 1,
                topStoreStatistics: 1,
                acceptTokensAfterDate: 1,
                analyticsManagersCount: 1,
            }
        )
    }

    async getUserStatistics(minusDay = 0) {
        let date = new Date(
            new Date(Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - minusDay)).getTime() -
                6 * 60 * 60 * 1000
        )

        return {
            total: await this.userModel.count({}),
            todayRegistered: await this.userModel.count({
                createdAt: {
                    $gte: date,
                },
            }),
        }
    }

    async searchUsersByKeyWord(keyword: string) {
        if (!keyword) {
            return []
        }

        const query = {
            $or: [
                {
                    email: {
                        $regex: keyword || '',
                        $options: 'i',
                    },
                },
                {
                    name: {
                        $regex: keyword || '',
                        $options: 'i',
                    },
                },
                {
                    surname: {
                        $regex: keyword || '',
                        $options: 'i',
                    },
                },
            ],
        }

        return this.userModel.find(query).lean()
    }

    async testUsed(userId: string) {
        this.userModel.updateOne({ _id: userId }, { isTestUsed: true })
    }

    async giveNewStore(userId: string) {
        const user = await this.userModel.findOne({ _id: userId })

        if (user) {
            await this.userModel.updateOne(
                {
                    _id: userId,
                },
                {
                    storeLimit: user.storeLimit + 1,
                }
            )
        }
    }

    async isBlocked(userId: string) {
        if (!isValidObjectId(userId)) {
            throw new NotFoundException()
        }

        const user = await this.userModel
            .findOne({
                _id: userId,
            })
            .select({
                isBlocked: 1,
            })

        if (!user) {
            throw new NotFoundException()
        }

        return user.isBlocked
    }

    async getProfileInfo(userId: string) {
        if (!isValidObjectId(userId)) {
            throw new UnauthorizedException()
        }

        const profile = await this.userModel.aggregate([
            {
                $match: {
                    _id: new Types.ObjectId(userId),
                },
            },
            {
                $lookup: {
                    from: 'Store',
                    as: 'stores',
                    localField: '_id',
                    foreignField: 'userId',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'PrivilegedStore',
                                as: 'privilege',
                                localField: '_id',
                                foreignField: 'storeId',
                                pipeline: [
                                    {
                                        $match: {
                                            isActive: true,
                                            isBlocked: false,
                                        },
                                    },
                                ],
                            },
                        },
                        {
                            $match: {
                                privilege: {
                                    $ne: [],
                                },
                            },
                        },
                    ],
                },
            },
            {
                $lookup: {
                    from: 'Payment',
                    as: 'payments',
                    localField: '_id',
                    foreignField: 'userId',
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $gte: ['$newExpireDate', new Date()],
                                        },
                                        {
                                            $eq: ['$type', 'ANALYTICS'],
                                        },
                                    ],
                                },
                            },
                        },
                    ],
                },
            },
                {
                $lookup: {
                    from: 'UserAcceptedAgreement',
                    as: 'agreement',
                    localField: '_id',
                    foreignField: 'userId',
                    pipeline: [
                        {
                            $match: {
                                userAgreementAccepted: true,
                            },
                        },
                        {
                            $limit: 1,
                        },
                    ],
                },
            },
            {
                $set: {
                    isShowAnalytics: {
                        $cond: [
                            {
                                $and: [
                                    {
                                        $eq: ['$isShowAnalytics', false],
                                    },
                                    {
                                        $eq: ['$payments', []],
                                    },
                                ],
                            },
                            false,
                            true,
                        ],
                    },
                    termsAccepted: {
                        $gt: [
                            {
                                $size: '$agreement',
                            },
                            0,
                        ],
                    },
                    termsAcceptedAt: {
                        $first: '$agreement.userAgreementAcceptedAt',
                    },
                },
            },
            {
                $project: {
                    isShowAnalytics: 1,
                    name: 1,
                    surname: 1,
                    phoneNumber: `$email`,
                    isShowMessage: 1,
                    topStoreStatistics: 1,
                    expressAnalyticsRequestCount: 1,
                    isNew: 1,
                    showNewFeature: 1,
                    termsAccepted: 1,
                    termsAcceptedAt: 1,
                },
            },
        ])

        if (profile.length === 0) {
            throw new UnauthorizedException()
        }

        return profile[0]
    }

    async getAgreement(userId: string) {
        if (!isValidObjectId(userId)) {
            throw new UnauthorizedException()
        }

        return this.userAgreementModel.findOne({ userId: new Types.ObjectId(userId) })
    }

    async acceptUserAgreement(userId: string, dto: AcceptAgreementDto, req: Request) {
        console.log(`[USER AGREEMENT] acceptUserAgreement called for userId: ${userId}`)
        console.log(`[USER AGREEMENT] Model instance check:`, {
            modelExists: !!this.userAgreementModel,
            modelName: this.userAgreementModel?.modelName,
            collectionName: this.userAgreementModel?.collection?.name,
        })
        
        if (!isValidObjectId(userId)) {
            console.error(`[USER AGREEMENT] Invalid userId: ${userId}`)
            throw new UnauthorizedException()
        }

        const existing = await this.userAgreementModel.findOne({ userId: new Types.ObjectId(userId) })
        if (existing) {
            console.log(`[USER AGREEMENT] Agreement already exists for userId: ${userId}`)
            return existing
        }

        const ip = this.getClientIp(req)
        const userAgent = dto.userAgent || req.headers['user-agent'] || ''

        // Логируем все доступные источники IP для отладки
        console.log(`[USER AGREEMENT] IP extraction debug:`, {
            'x-forwarded-for': req.headers['x-forwarded-for'],
            'x-real-ip': req.headers['x-real-ip'],
            'cf-connecting-ip': req.headers['cf-connecting-ip'],
            'req.ip': req.ip,
            'req.socket.remoteAddress': req.socket.remoteAddress,
            'extracted-ip': ip,
        })

        const userAgreementAcceptedAt = new Date()
        
        const payload: Partial<UserAgreementModel> = {
            userId: new Types.ObjectId(userId),
            userAgreementAccepted: true,
            userAgreementAcceptedAt,
            ip,
            userAgent,
            clientInfo: dto.clientInfo || {},
        }

        console.log(`[USER AGREEMENT] Creating new agreement with payload:`, {
            userId: payload.userId?.toString(),
            userAgreementAccepted: payload.userAgreementAccepted,
            userAgreementAcceptedAt: payload.userAgreementAcceptedAt,
            ip: payload.ip,
            userAgent: payload.userAgent?.substring(0, 50),
            clientInfo: payload.clientInfo,
        })

        try {
            const agreement = new this.userAgreementModel(payload)

            console.log(`[USER AGREEMENT] Saving agreement to database...`)
            console.log(`[USER AGREEMENT] Collection name: ${this.userAgreementModel.collection.name}`)
            const dbName = this.userAgreementModel.db.name || 'unknown'
            console.log(`[USER AGREEMENT] Database name: ${dbName}`)
            
            const saved = await agreement.save()
            
            console.log(`[USER AGREEMENT] Agreement saved successfully:`, {
                _id: saved._id,
                userId: saved.userId,
                userAgreementAccepted: saved.userAgreementAccepted,
                userAgreementAcceptedAt: saved.userAgreementAcceptedAt,
                ip: saved.ip,
                collection: this.userAgreementModel.collection.name,
                database: dbName,
            })

            return saved
        } catch (saveError) {
            console.error(`[USER AGREEMENT] Error saving agreement:`, saveError)
            if (saveError instanceof Error) {
                console.error(`[USER AGREEMENT] Error details:`, {
                    message: saveError.message,
                    name: saveError.name,
                    stack: saveError.stack,
                })
            }
            throw saveError
        }
    }

    private getClientIp(req: Request): string {
        // Проверяем заголовки прокси (в порядке приоритета)
        const forwardedFor = req.headers['x-forwarded-for']
        if (forwardedFor) {
            if (Array.isArray(forwardedFor)) {
                const ip = forwardedFor[0]?.trim()
                if (ip && ip !== '::1' && !ip.startsWith('::ffff:127.0.0.1')) {
                    return ip
                }
            } else if (typeof forwardedFor === 'string' && forwardedFor.length > 0) {
                const ip = forwardedFor.split(',')[0].trim()
                if (ip && ip !== '::1' && !ip.startsWith('::ffff:127.0.0.1')) {
                    return ip
                }
            }
        }

        // Проверяем другие заголовки прокси
        const realIp = req.headers['x-real-ip']
        if (realIp && typeof realIp === 'string') {
            const ip = realIp.trim()
            if (ip && ip !== '::1' && !ip.startsWith('::ffff:127.0.0.1')) {
                return ip
            }
        }

        // Cloudflare
        const cfConnectingIp = req.headers['cf-connecting-ip']
        if (cfConnectingIp && typeof cfConnectingIp === 'string') {
            const ip = cfConnectingIp.trim()
            if (ip && ip !== '::1' && !ip.startsWith('::ffff:127.0.0.1')) {
                return ip
            }
        }

        // Используем req.ip (если настроен trust proxy)
        if (req.ip && req.ip !== '::1' && !req.ip.startsWith('::ffff:127.0.0.1')) {
            return req.ip
        }

        // Последний вариант - socket remoteAddress
        const socketIp = req.socket.remoteAddress
        if (socketIp && socketIp !== '::1' && !socketIp.startsWith('::ffff:127.0.0.1')) {
            return socketIp
        }

        // Если все варианты вернули localhost, возвращаем как есть (для локальной разработки)
        // В продакшене это не должно происходить, если настроен trust proxy
        return req.ip || req.socket.remoteAddress || 'unknown'
    }

  
    public async updateProfileInfo(
        userId: string,
        dto: {
            cid: string
        }
    ): Promise<void> {
        if (!isValidObjectId(userId)) {
            return
        }

        await this.userModel.updateOne(
            {
                _id: userId,
            },
            {
                cid: dto.cid,
            }
        )

        const exists = await this.userCidHistoryModel.exists({ userId, cid: dto.cid })
        if (!exists) {
            await new this.userCidHistoryModel({ userId, cid: dto.cid }).save().catch((e) => {
                console.log('[^]' + ' user.sarvice ' + ' | ' + new Date() + ' | ' + '\n'+e);
            })
        }
    }

    async resetAcceptTokensAfterDate(userId: string) {
        try {
            await this.userModel.updateOne({ _id: userId }, { acceptTokensAfterDate: new Date() })
        } catch (e) {
            console.log('[^]' + ' user.sarvice ' + ' | ' + new Date() + ' | ' + '\n'+e);
        }
    }

    async updateUserNewFeatures(userId: string, dto: UpdateUserNewFeatureDto) {
        try {
            await this.userModel.updateOne({ _id: userId }, { isNew: dto.isNew, showNewFeature: dto.showNewFeature })
        } catch (e) {
            console.log('[^]' + ' user.sarvice ' + ' | ' + new Date() + ' | ' + '\n'+e);
        }
    }

    async isHavePayments(phoneNumber: string) {
        try {
            const user = await this.userModel.findOne({ email: `+${phoneNumber}` })
            
            if (!user) {
                return false
            }

            const stores = await this.storeModel.findOne(
                { 
                    userId: user._id, 
                    expireDate: {
                        $gt: new Date()
                    }
                }
            )

            if (stores) {
                return true
            }

            return false
        } catch (e) {

        }
    }
}
function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
