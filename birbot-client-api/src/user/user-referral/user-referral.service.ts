import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'
import { ModelType } from '@typegoose/typegoose/lib/types'
import { InjectModel } from 'nestjs-typegoose'
import { UserModel } from '../user.model'
import { UserReferralModel } from './user-referral.model'
import { isValidObjectId, Types } from 'mongoose'
import { PaymentModel } from 'src/payment/payment.model'
import { ReferralPaymentModel } from 'src/payment/referral-payment.model'

const randtoken = require('rand-token')

type Referral = {
    name: string
    registrationDate: Date
    income: number,
    used: boolean
}

type ReferralResponseType = {
    refCode: string
    totalRefCount: number
    totalIncome: number
    monthlyRefCount: number
    monthlyIncome: number,
    balance: number,
    referrals: Referral[]
}

@Injectable()
export class UserReferralService {
    constructor(
        @InjectModel(UserReferralModel)
        private readonly userReferralModel: ModelType<UserReferralModel>,
        @InjectModel(UserModel)
        private readonly userModel: ModelType<UserModel>,
        @InjectModel(PaymentModel)
        private readonly paymentModel: ModelType<PaymentModel>,
        @InjectModel(ReferralPaymentModel)
        private readonly referralPaymentModel: ModelType<ReferralPaymentModel>,
        
    ) {
        this.test()
    }

    async test() {
        const users = await this.userModel.find()

        for (const user of users) {
            try {
                await this.generateCode(user._id.toString())
            } catch (_) { }
        }
    }

    async generateCode(userId: string) {
        if (!isValidObjectId(userId)) {
            throw new BadRequestException()
        }

        let foundUserReferral = await this.userReferralModel.exists({
            userId,
        })

        if (foundUserReferral) {
            throw new BadRequestException()
        }

        const CODE_LENGTH = 7

        let code = randtoken.generate(CODE_LENGTH)
        while (true) {
            foundUserReferral = await this.userReferralModel.exists({
                code,
            })

            if (!foundUserReferral) {
                break
            }

            code = randtoken.generate(CODE_LENGTH)
        }

        await new this.userReferralModel({
            userId,
            code,
        }).save()
    }

    async getUserIdByCode(code: string): Promise<null | Types.ObjectId> {
        const foundUserReferral = await this.userReferralModel.findOne({
            code,
        })

        if (foundUserReferral) {
            return foundUserReferral.userId
        }

        return null
    }

    async getCodeByUserId(userId: string): Promise<string> {
        const code = await this.userReferralModel.findOne({
            userId
        })

        if (code?.code) {
            return code.code
        }

        return null
    }

    async getUserReferrals(userId: string): Promise<ReferralResponseType> {
        const referralStartDate = new Date('2024-11-25'); 
        referralStartDate.setHours(0, 0, 0, 0); 
        const findedReferrals = await this.userModel.find({ referer: userId, createdAt: { $gt: referralStartDate } }).sort({_id: -1})
        const refCode = await this.getCodeByUserId(userId)
        const today = new Date().getTime()

        if (!findedReferrals || findedReferrals.length === 0) {
            return {
                refCode: `https://salescout.me/r/${refCode}`,
                totalRefCount: 0,
                totalIncome: 0,
                monthlyRefCount: 0,
                monthlyIncome:0,
                balance: 0,
                referrals: []
            }
        }

        const referrals: Referral[] = []
        console.log(`Total refs: ${findedReferrals.length}`)
        
        for (const ref of findedReferrals) {
            const payments = await this.referralPaymentModel.find({userId: ref._id})
            
            if (!payments || payments.length === 0) {
                continue
            }
            
            for (const payment of payments) {
                if (payment.price){
                    referrals.push(
                        {
                            name: ref.name,
                            registrationDate: payment.createdAt,
                            income: payment.price,
                            used: payment.isUsed
                        }
                    )
                }
            }
        }

        const totalRefCount = findedReferrals.length
        const totalIncome = referrals.reduce((sum, referral) => sum + referral.income, 0)
        const balance = referrals.reduce((sum, referral) => sum + (referral.used? 0: referral.income), 0)

        const monthRefs = referrals.filter((ref) => (today - ref.registrationDate.getTime()) <= 1000 * 60 * 60 * 24 * 30)
        const monthlyRefCount = monthRefs.length
        const monthlyIncome = monthlyRefCount > 0 ? monthRefs.reduce((sum, referral) => sum + referral.income, 0) : 0

        return {
            refCode: `https://salescout.me/r/${refCode}`,
            totalRefCount,
            balance: balance * 0.1,
            totalIncome: totalIncome * 0.1,
            monthlyRefCount,
            monthlyIncome: monthlyIncome * 0.1,
            referrals
        }
    }

    async sendReferralMoneyBackMessage(userId: string, value: number) {
        console.log(`Referral money back request: userId=${userId}, value=${value}`)
        return { success: true }
    }
}
