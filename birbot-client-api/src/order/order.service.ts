import {
    BadRequestException,
    forwardRef,
    Inject,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common'
import { InjectModel } from 'nestjs-typegoose'
import { OrderModel } from './order.model'
import { ModelType } from '@typegoose/typegoose/lib/types'
import mongoose, { isValidObjectId, ObjectId, Types } from 'mongoose'
import { STORE_NOT_FOUND_ERROR } from 'src/store/store.constants'
import { StoreService } from 'src/store/store.service'
import { ProductService } from 'src/product/product.service'
import { PRODUCT_NOT_FOUND_ERROR } from 'src/product/product.constant'
import { BestSellingProductDto } from './dto/best-selling-product.dto'
import { GetOrderDetailsModel } from './get-order-details-history.model'
import { createClient } from 'redis'
import { OrderApiTokenModel } from './order-api-token.model'
import { isNumber } from 'class-validator'
import { OrderProductEntryModel } from './order-product-entry.model'
import { OrderProductEntryImageModel } from './order-product-entry-image.model'
import { OrderImageModel } from './order-image.model'
import { UpdateOrderDto } from './dto/update-order.dto'
import * as moment from 'moment'
import { KaspiStorePickupPointModel } from 'src/store/kaspi-store-pickup-point.model'
import { KaspiCategoryComissionModule } from '../kaspi-category-comission/kaspi-category-comission.module'; // <--- Import this
import { KaspiCategoryComissionService } from '../kaspi-category-comission/kaspi-category-comission.service'
import { HttpsProxyAgent } from 'https-proxy-agent'
import { parse } from 'url'
import { ProxyService } from 'src/proxy/proxy.service'
import axios from 'axios'
import { RefundModel } from './refund.model'
import { ProductModel } from 'src/product/product.model'
import { Response } from 'express'
import { StoreCityModel } from 'src/store-city/store-city.model'
import { SSTapOrderModel } from './ss-tap-order.model'
import { privateDecrypt, Verify } from 'crypto'
import { VerifyOrderRecievingDto } from 'src/store/dto/verify-order-recieving.dto'
import { UserService } from 'src/user/user.service'
import * as fs from "fs"
import { PDFDocument } from 'pdf-lib'

export type GetStoreOrdersOptionsType = {
    storeId: string
    state: string
    page: number
    limit: number
    query: string
    town?: string
    dateFrom?: string
    dateTo?: string
}

export type GetStoreSSOrdersOptionsType = {
    storeId: string
    state: string
    page: number
    limit: number
    town?: string
    dateFrom?: string
    dateTo?: string
}

interface QueryOptions {
    storeId: Types.ObjectId
    state?: string
    fromSSTap?: boolean
    originCity?: string
    subState?: string
    $text?: { $search: string }
    $or?: Array<{ [key: string]: any }>
    creationDate?: {
        $gte?: Date
        $lt?: Date
    },
    status?: {
        $ne?: string
    },
}

interface CreateOrder {
    storeId: Types.ObjectId,
    amount: number,
    products: { sku: string, price: number, quantity: number }[],
    customerPhone: string,
    deliveryAddress: string
}

@Injectable()
export class OrderService {
    private readonly redisClient = createClient({
        url: `redis://:J5ofH3I1SlgAnVHV2toM7X5HkWByiEMn@kz1-a-i2u2dt2ktvbnj9ug.mdb.yandexcloud.kz:6379`,
    })

    constructor(
        @InjectModel(OrderModel) private readonly orderModel: ModelType<OrderModel>,
        @InjectModel(SSTapOrderModel) private readonly ssTapOrderModel: ModelType<SSTapOrderModel>,
        @InjectModel(KaspiStorePickupPointModel)
        private readonly kaspiStorePickupPointModel: ModelType<KaspiStorePickupPointModel>,
        @InjectModel(OrderImageModel) private readonly orderImageModel: ModelType<OrderImageModel>,
        @InjectModel(OrderProductEntryModel) private readonly orderProductEntryModel: ModelType<OrderProductEntryModel>,
        @InjectModel(OrderProductEntryImageModel) private readonly orderProductEntryImageModel: ModelType<OrderProductEntryImageModel>,
        @InjectModel(GetOrderDetailsModel) private readonly getOrderDetailsModel: ModelType<GetOrderDetailsModel>,
        @InjectModel(OrderApiTokenModel) private readonly orderApiTokenModel: ModelType<OrderApiTokenModel>,
        @InjectModel(RefundModel) private readonly refundModel: ModelType<RefundModel>,
        @InjectModel(ProductModel) private readonly productModel: ModelType<ProductModel>,

        private readonly kaspiCategoryComissionService: KaspiCategoryComissionService, // <--- ADD THIS
        @Inject(forwardRef(() => StoreService))
        private readonly storeService: StoreService,
        @Inject(forwardRef(() => ProductService))
        private readonly productService: ProductService,
        @Inject(forwardRef(() => ProxyService))
        private readonly proxyService: ProxyService,
        @Inject(forwardRef(() => UserService))
        private readonly userService: UserService,
    ) {
        this.redisClient.connect().catch((e) => {
            console.log('[^]' + ' order.service ' + ' | ' + new Date() + ' | ' + '\n' + e);
        })
        // this.test()
    }

    public async getStatusesReport(storeId: string) {
        const result = {
            newAndSignRequiredCount: {
                totalPrice: 0,
                count: 0,
            },
            pickupCount: {
                totalPrice: 0,
                count: 0,
            },
            deliveryCount: {
                totalPrice: 0,
                count: 0,
            },
            kaspiDeliveryCount: {
                totalPrice: 0,
                count: 0,
            },
        }

        const data = await this.orderModel.aggregate([
            {
                $match: {
                    storeId: new Types.ObjectId(storeId),
                    state: {
                        $ne: 'ARCHIVE',
                    },
                    $and: [
                        {
                            status: {
                                $ne: 'CANCELLED',
                            },
                        },
                        {
                            status: {
                                $ne: 'CANCELLING',
                            },
                        },
                        {
                            status: {
                                $ne: 'RETURNED',
                            },
                        },
                    ],
                    creationDate: {
                        $gte: new Date(new Date().getTime() - 21 * 24 * 60 * 60 * 1000),
                    },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
            {
                $group: {
                    _id: '$state',
                    totalPrice: {
                        $sum: '$totalPrice',
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
        ])

        for (const d of data) {
            if (d._id === 'NEW' || d._id === 'SIGN_REQUIRED') {
                result.newAndSignRequiredCount.totalPrice += d.totalPrice
                result.newAndSignRequiredCount.count += d.count
            }
            if (d._id === 'PICKUP') {
                result.pickupCount.totalPrice += d.totalPrice
                result.pickupCount.count += d.count
            }
            if (d._id === 'KASPI_DELIVERY') {
                result.kaspiDeliveryCount.totalPrice += d.totalPrice
                result.kaspiDeliveryCount.count += d.count
            }
            if (d._id === 'DELIVERY') {
                result.deliveryCount.totalPrice += d.totalPrice
                result.deliveryCount.count += d.count
            }
        }

        return result
    }
    async getFirstOrderDate(storeId: string): Promise<Date | null> {
        const firstOrder = await this.orderModel
            .findOne({ storeId: new Types.ObjectId(storeId) })
            .sort({ creationDate: 1 })
            .limit(1)
        return firstOrder ? firstOrder.creationDate : null
    }

    async getBestSellingProducts(limit = 50): Promise<BestSellingProductDto[]> {
        const orders = await this.orderModel.aggregate([
            {
                $match: {
                    creationDate: {
                        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            },
            {
                $group: {
                    _id: '$productCode',
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
            {
                $limit: limit,
            },
        ])

        const result: BestSellingProductDto[] = []

        for (const order of orders) {
            const newProduct: BestSellingProductDto = {
                sku: order._id,
                count: order.count,
            }

            result.push(newProduct)
        }

        return result
    }

    async getOrderStatsByStoreId(storeId: string, filter = 'today', startDateFromWeb?: Date, endDateFromWeb?: Date) {
        const filters = ['today', 'yesterday', 'week', 'month', 'rangeData']
        if (!filters.includes(filter)) {
            throw new BadRequestException('Неверная фильтрация')
        }
        if (startDateFromWeb) {
            startDateFromWeb.setUTCHours(startDateFromWeb.getUTCHours() - 6)
        }
        if (endDateFromWeb) {
            endDateFromWeb.setUTCHours(endDateFromWeb.getUTCHours() - 6)
        }

        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        // const month = new Date().getMonth()

        const startDate = this.getStartDate(filter, startDateFromWeb, endDateFromWeb)
        // const startDate = new Date(new Date().getFullYear(), month, new Date().getDate(), 0, 0, 0, 0)
        // let endDate = new Date(new Date().getFullYear(), month, new Date().getDate(), 23, 59, 59, 999)
        let endDate = new Date()

        // console.log(startDate, endDate)

        if (filter === 'yesterday') {
            endDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1, 23, 59, 59, 999)
        }

        const orders = await this.orderModel
            .find({
                storeId,
                status: {
                    $ne: 'CANCELLED',
                },
                creationDate: {
                    $gte: startDate,
                    $lte: endDate,
                },
            })
            .select({
                creationDate: 1,
                quantity: 1,
                totalPrice: 1,
            })

        const profit = 0
        let totalPrice = 0
        const ordersPer = {}
        let totalDays = 0

        for (const order of orders) {
            let key = ''
            const creationDate = order.creationDate
            if (filter === 'today' || filter === 'yesterday') {
                const hours = creationDate.getHours() > 9 ? creationDate.getHours() : '0' + creationDate.getHours()
                key = `${hours}`
            } else {
                const day = creationDate.getDate() > 9 ? creationDate.getDate() : '0' + creationDate.getDate()
                const month = creationDate.getMonth() + 1 > 9 ? creationDate.getMonth() + 1 : '0' + (creationDate.getMonth() + 1)

                key = `${day}.${month}`
            }

            if (!ordersPer[key]) {
                ordersPer[key] = 0
                totalDays++
            }
            ordersPer[key] += order.quantity

            totalPrice += order.totalPrice
        }

        if (filter === 'today') {
            totalDays = new Date().getHours()
        } else if (filter === 'yesterday') {
            totalDays = 24
        }

        const result = {
            totalOrders: orders.length,
            orders: ordersPer,
            profit,
            totalPrice,
            soldPerDay: ((orders.length * 1.0) / (totalDays * 1.0)).toFixed(1),
        }

        return result
    }

    private getStartDate(filter = 'week', startDateFromWeb?: Date, endDateFromWeb?: Date) {
        let date = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate())
        let numberOfDay = 0

        if (filter === 'week') {
            numberOfDay = 7
        } else if (filter === 'yesterday') {
            numberOfDay = 1
        } else if (filter === 'today') {
            numberOfDay = 0
        } else if (filter === 'rangeData') {
            const startDate = moment().startOf('month').toDate()
            const endDate = moment().endOf('month').toDate()
            numberOfDay = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24))
        } else if (filter === 'month') {
            if (startDateFromWeb && endDateFromWeb) {
                numberOfDay = Math.floor((endDateFromWeb.getTime() - startDateFromWeb.getTime()) / (1000 * 60 * 60 * 24)) + 1
            } else {
                console.error('startDateFromWeb or endDateFromWeb is undefined')

                startDateFromWeb = moment().startOf('month').toDate()
                endDateFromWeb = moment().endOf('month').toDate()
                numberOfDay = Math.floor((endDateFromWeb.getTime() - startDateFromWeb.getTime()) / (1000 * 60 * 60 * 24)) + 1
            }
        }

        // date = new Date(
        //   new Date(
        //     Date.UTC(
        //       new Date().getFullYear(),
        //       new Date().getMonth(),
        //       new Date().getDate() - numberOfDay,
        //       0,
        //       0,
        //       0,
        //       0,
        //     ),
        //   ).getTime() -
        //     6 * 60 * 60 * 1000,
        // );

        date = new Date(date.getTime() - 1000 * 60 * 60 * 24 * numberOfDay)

        return date
    }

    async getOrdersStattisticsLast24Hours() {
        const key = 'getOrdersStattisticsLast24Hours'

        try {
            const cachData = await this.redisClient.get(key)
            if (cachData) {
                return JSON.parse(cachData)
            }
        } catch (e) {
            console.log('[^]' + ' order.service ' + ' | ' + new Date() + ' | ' + '\n' + e);
        }

        const currentDate = new Date()
        const startDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000)

        const data = await this.orderModel.aggregate([
            {
                $match: {
                    creationDate: {
                        $gte: startDate,
                        $lte: currentDate,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$totalPrice',
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
        ])

        const result = {
            totalPrice: 0,
            totalCount: 0,
        }

        if (data.length !== 0) {
            result.totalPrice = data[0].total
            result.totalCount = data[0].count
        }

        await this.redisClient.set(key, JSON.stringify(result), { EX: 10 * 60 }).catch(console.log)

        return result
    }

    async getOrdersStattisticsLastMonth() {
        const key = 'getOrdersStattisticsLastMonth'

        try {
            const cachData = await this.redisClient.get(key)
            if (cachData) {
                return JSON.parse(cachData)
            }
        } catch (e) {
            console.log('[^]' + ' order.service ' + ' | ' + new Date() + ' | ' + '\n' + e);
        }

        const currentDate = new Date()
        const startDate = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000)

        const data = await this.orderModel.aggregate([
            {
                $match: {
                    creationDate: {
                        $gte: startDate,
                        $lte: currentDate,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$totalPrice',
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
        ])

        const result = {
            totalPrice: 0,
            totalCount: 0,
        }

        if (data.length !== 0) {
            result.totalPrice = data[0].total
            result.totalCount = data[0].count
        }

        await this.redisClient.set(key, JSON.stringify(result), { EX: 10 * 60 }).catch((e) => {
            console.log('[^]' + ' order.service ' + ' | ' + new Date() + ' | ' + '\n' + e);
        })

        return result
    }

    async getOrderStatisctics(minusDay = 0, type = 'telegram') {
        let lteDate = new Date()
        if (minusDay !== 0) {
            lteDate = new Date(
                new Date(
                    Date.UTC(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - minusDay, 23, 59, 59, 999)
                ).getTime() -
                6 * 60 * 60 * 1000
            )
        }

        const todayOrders = await this.orderModel.aggregate([
            {
                $match: {
                    creationDate: {
                        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - minusDay),
                        $lte: lteDate,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    total: {
                        $sum: '$totalPrice',
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
        ])

        let todayTotalSum = 0
        let today = 0
        if (todayOrders.length) {
            todayTotalSum = todayOrders[0].total
            today = todayOrders[0].count
        }

        const result = {
            total: 0,
            launchStores: 0,
            today,
            todayTotalSum,
        }

        if (type === 'telegram') {
            result.total = await this.orderModel.count({})
            result.launchStores = await this.storeService.getCountOfApiTokens()
        }

        return result
    }

    async getTopSellingProducts(storeId: string, filter = 'week', limit = 10) {
        if (!isValidObjectId(storeId)) {
            return []
        }

        const startDate = this.getStartDate(filter)
        let endDate = new Date()
        if (filter === 'yesterday') {
            endDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1, 23, 59, 59, 999)
        }
        endDate.setHours(endDate.getHours() + 6)

        return await this.orderModel.aggregate([
            {
                $match: {
                    storeId: new Types.ObjectId(storeId),
                    status: {
                        $ne: 'CANCELLED',
                    },
                    creationDate: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },
            {
                $lookup: {
                    from: 'Product',
                    as: 'product',
                    localField: 'productCode',
                    foreignField: 'masterProduct.sku',
                    pipeline: [
                        {
                            $project: {
                                img: 1,
                            },
                        },
                    ],
                },
            },
            {
                $match: {
                    product: { $ne: [] },
                },
            },
            {
                $set: {
                    product: {
                        $arrayElemAt: ['$product', 0],
                    },
                },
            },
            {
                $group: {
                    _id: '$productCode',
                    count: {
                        $sum: 1,
                    },
                    name: {
                        $first: '$productName',
                    },
                    averagePrice: {
                        $avg: '$totalPrice',
                    },
                    totalPrice: {
                        $sum: '$totalPrice',
                    },
                    averageQuantity: {
                        $avg: '$quantity',
                    },
                    totalQuantity: {
                        $sum: '$quantity',
                    },
                    averageDeliveryCost: {
                        $avg: '$deliveryCost',
                    },
                    img: {
                        $first: '$product.img',
                    },
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
            {
                $limit: limit,
            },
        ])
    }

    async getTopSellingProductsByTotalPrice(storeId: string, filter = 'rangeData', limit?: number) {
        if (!isValidObjectId(storeId)) {
            return []
        }

        const startDate = this.getStartDate(filter)
        let endDate = new Date()
        if (filter === 'yesterday') {
            endDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1, 23, 59, 59, 999)
        }
        endDate.setHours(endDate.getHours() + 6)

        const pipeline: any[] = [
            {
                $match: {
                    storeId: new Types.ObjectId(storeId),
                    status: {
                        $ne: 'CANCELLED',
                    },
                    creationDate: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },
            {
                $lookup: {
                    from: 'Product',
                    as: 'product',
                    localField: 'productCode',
                    foreignField: 'masterProduct.sku',
                    pipeline: [
                        {
                            $project: {
                                img: 1,
                                price: 1,
                                availableMinPrice: 1,
                            },
                        },
                    ],
                },
            },
            {
                $match: {
                    product: { $ne: [] },
                },
            },
            {
                $set: {
                    product: {
                        $arrayElemAt: ['$product', 0],
                    },
                },
            },
            {
                $group: {
                    _id: '$productCode',
                    count: {
                        $sum: 1,
                    },
                    name: {
                        $first: '$productName',
                    },
                    averagePrice: {
                        $avg: '$totalPrice',
                    },
                    totalPrice: {
                        $sum: '$totalPrice',
                    },
                    averageQuantity: {
                        $avg: '$quantity',
                    },
                    totalQuantity: {
                        $sum: '$quantity',
                    },
                    averageDeliveryCost: {
                        $avg: '$deliveryCost',
                    },
                    img: {
                        $first: '$product.img',
                    },
                    url: {
                        $first: '$url',
                    },
                    price: {
                        $first: '$product.price',
                    },
                    availableMinPrice: {
                        $first: '$product.availableMinPrice',
                    },
                },
            },
            {
                $project: {
                    price: 1,
                    availableMinPrice: 1,
                    name: 1,
                    url: 1,
                    sku: 1,
                    img: 1,
                    count: 1,
                    totalPrice: 1,
                    profit: {
                        $subtract: ['$totalPrice', { $multiply: ['$availableMinPrice', '$count'] }],
                    },
                },
            },
            {
                $sort: {
                    totalPrice: -1,
                },
            },
            // {
            //     $limit: limit,
            // },
        ]

        if (limit !== undefined) {
            pipeline.push({
                $limit: limit,
            })
        }

        return await this.orderModel.aggregate(pipeline)
    }

    async getTop5PoorlySellingProducts(storeId: string) {
        if (!isValidObjectId(storeId)) {
            return []
        }

        return await this.orderModel.aggregate([
            {
                $match: {
                    storeId: new Types.ObjectId(storeId),
                    status: {
                        $ne: 'CANCELLED',
                    },
                },
            },
            {
                $group: {
                    _id: '$productCode',
                    count: {
                        $sum: 1,
                    },
                    name: {
                        $first: '$productName',
                    },
                    // data: {
                    //   $push: {
                    //     _id: '$_id',
                    //     orderId: '$orderId',
                    //     town: '$town',
                    //     price: '$totalPrice',
                    //     quantity: '$quantity',
                    //     deliveryAddress: '$deliveryAddress',
                    //     deliveryCost: '$deliveryCost',
                    //     url: '$url',
                    //     creationDate: '$creationDate',
                    //   },
                    // },
                    averagePrice: {
                        $avg: '$totalPrice',
                    },
                    totalPrice: {
                        $sum: '$totalPrice',
                    },
                    averageQuantity: {
                        $avg: '$quantity',
                    },
                    totalQuantity: {
                        $sum: '$quantity',
                    },
                    averageDeliveryCost: {
                        $avg: '$deliveryCost',
                    },
                },
            },
            {
                $sort: {
                    count: 1,
                },
            },
            {
                $limit: 5,
            },
        ])
    }

    async getTop5LowSellingCities(storeId: string, filter = 'week') {
        if (!isValidObjectId(storeId)) {
            return []
        }

        const startDate = this.getStartDate(filter)
        let endDate = new Date()
        if (filter === 'yesterday') {
            endDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 1, 23, 59, 59, 999)
        }

        return await this.orderModel.aggregate([
            {
                $match: {
                    storeId: new Types.ObjectId(storeId),
                    creationDate: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                    status: {
                        $ne: 'CANCELLED',
                    },
                },
            },
            {
                $group: {
                    _id: '$town',
                    // data: {
                    //   $push: {
                    //     _id: '$_id',
                    //     orderId: '$orderId',
                    //     productCode: '$productCode',
                    //     name: '$productName',
                    //     price: '$totalPrice',
                    //     quantity: '$quantity',
                    //     deliveryAddress: '$deliveryAddress',
                    //     deliveryCost: '$deliveryCost',
                    //     url: '$url',
                    //     creationDate: '$creationDate',
                    //   },
                    // },
                    averagePrice: {
                        $avg: '$totalPrice',
                    },
                    totalPrice: {
                        $sum: '$totalPrice',
                    },
                    averageQuantity: {
                        $avg: '$quantity',
                    },
                    totalQuantity: {
                        $sum: '$quantity',
                    },
                    averageDeliveryCost: {
                        $avg: '$deliveryCost',
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    count: 1,
                },
            },
            {
                $limit: 5,
            },
        ])
    }

    async getTop5SellingCities(storeId: string, filter = 'today', limit = 5) {
        if (!isValidObjectId(storeId)) {
            return []
        }

        const startDate = this.getStartDate(filter)

        return await this.orderModel.aggregate([
            {
                $match: {
                    storeId: new Types.ObjectId(storeId),
                    creationDate: {
                        $gte: startDate,
                    },
                    status: {
                        $ne: 'CANCELLED',
                    },
                },
            },
            {
                $group: {
                    _id: '$town',
                    averagePrice: {
                        $avg: '$totalPrice',
                    },
                    totalPrice: {
                        $sum: '$totalPrice',
                    },
                    averageQuantity: {
                        $avg: '$quantity',
                    },
                    totalQuantity: {
                        $sum: '$quantity',
                    },
                    averageDeliveryCost: {
                        $avg: '$deliveryCost',
                    },
                    count: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    count: -1,
                },
            },
            {
                $limit: limit,
            },
        ])
    }

    async getProductOrders(productId: string) {
        if (!isValidObjectId(productId)) {
            throw new NotFoundException(PRODUCT_NOT_FOUND_ERROR)
        }

        const product = await this.productService.getProductById(productId)

        if (!product) {
            throw new NotFoundException(PRODUCT_NOT_FOUND_ERROR)
        }

        const orders = await this.orderModel.find({
            productCode: product.masterProduct['sku'],
            storeId: product.storeId,
        })

        return orders
    }

    async getOrdersInfo(
        sku: string,
        date: Date
    ): Promise<{
        numberOfOrdersPerDay: number
        numberOfOurSellersPerDay: number
        turnoverInOneDay: number
    }> {
        const fromDate = new Date(date.getTime())
        fromDate.setHours(0, 0, 0, 0)
        const toDate = new Date(date.getTime())
        toDate.setHours(23, 59, 59, 999)

        const ordersGrouppedByStores = await this.orderModel.aggregate([
            {
                $match: {
                    productCode: sku,
                    status: {
                        $ne: 'CANCELLED',
                    },
                    creationDate: {
                        $gte: fromDate,
                        $lte: toDate,
                    },
                },
            },
            {
                $group: {
                    _id: '$storeId',
                    turnoverInOneDay: {
                        $sum: '$totalPrice',
                    },
                    amountOfOrders: {
                        $sum: 1,
                    },
                },
            },
        ])

        let numberOfOrdersPerDay = 0
        let turnoverInOneDay = 0
        for (const order of ordersGrouppedByStores) {
            numberOfOrdersPerDay += order.amountOfOrders || 0
            turnoverInOneDay += order.turnoverInOneDay
        }

        return {
            numberOfOrdersPerDay,
            numberOfOurSellersPerDay: ordersGrouppedByStores.length,
            turnoverInOneDay,
        }
    }

       public async getStoreProfit(storeId: Types.ObjectId, fromDate: Date, toDate: Date) {
    console.log('--- STORE PROFIT CALCULATION STARTED ---');
    

    const store = await this.storeService.getStoreById(storeId.toString());
    

    const taxRegime = store?.taxRegime; 

     console.log('Inputs:', { 
        storeId: storeId.toString(), 
        fromDate, 
        toDate,
        taxRegime 
    });

    const orders = await this.orderModel.aggregate([
        {
            $match: {
                $expr: {
                    $and: [
                        {
                            $eq: ['$storeId', new Types.ObjectId(storeId)],
                        },
                        {
                            $eq: ['$status', 'COMPLETED'],
                        },
                        {
                            $gte: ['$completedDate', fromDate],
                        },
                        {
                            $lte: ['$completedDate', toDate],
                        },
                    ],
                },
            },
        },
        {
            $lookup: {
                from: 'Product',
                as: 'product',
                let: { masterProductSku: '$productCode' },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $and: [
                                    { $eq: ['$storeId', storeId] },
                                    { $eq: ['$masterProduct.sku', '$$masterProductSku'] }
                                ],
                            },
                        },
                    },
                    {
                        $project: {
                            availableMinPrice: 1,
                            purchasePrice: 1,
                            price: 1,
                        },
                    },
                    {
                        $limit: 1,
                    },
                ],
            },
        },
        {
            $match: {
                product: { $ne: [] },
            },
        },
        {
            $set: {
                product: {
                    $arrayElemAt: ['$product', 0],
                },
            },
        },
        {
            $project: {
                productCode: 1,
                productId: 1,
                orderId: 1,
                totalPrice: 1,
                quantity: 1,
                deliveryCost: 1,
                category: 1,
                availableMinPrice: '$product.availableMinPrice',
                purchasePrice: '$product.purchasePrice',
                weight: 1,
                deliveryMode: 1,
            },
        },
    ])

    console.log(`Total Orders Found: ${orders.length}`);

    if (orders.length === 0) {
        return { value: 0, percentageDifference: 0, isPurchasePrice: true };
    }

    
    const uniqueCategoryTitles = new Set(
        orders
            .map(o => o?.category?.title)
            .filter(title => title && title !== 'No title')
    );

    //console.log(`Fetching commissions for ${uniqueCategoryTitles.size} unique categories...`);

    // 2. Initialize Map with default value (10%)
    const categoryCommissionMap = new Map();
    uniqueCategoryTitles.forEach(title => categoryCommissionMap.set(title, 10));

    // 3. Fetch all categories in parallel
    await Promise.all(
        Array.from(uniqueCategoryTitles).map(async (title) => {
            try {
                const data = await this.kaspiCategoryComissionService.getCategoryByTitle(title, false);
                if (data && data.comissionStart) {
                    categoryCommissionMap.set(title, data.comissionStart);
                }
            } catch (e) {
                // Silently fail here, the default 10% remains in the map
                //console.error(`  Error fetching category "${title}":`, e.message);
            }
        })
    );
    // ---------------------------------------------

    let value = 0;
    let isPurchasePrice = true;

    for (const order of orders) {
        try {
            let purchasePrice = 0;
            if (order?.purchasePrice) {
                purchasePrice = order.purchasePrice;
            } else {
                purchasePrice = order?.availableMinPrice || 0;
                isPurchasePrice = false;
            }

            
            const category = order?.category || { title: '', code: '', categoryNameSecond: '', type: '' };
            const quantity = order?.quantity || 1;
            const totalPrice = order?.totalPrice || 0;
            const weight = ((order?.weight || 0) / 1000) * quantity;

            //console.log(`--- Processing Order ID: ${order.orderId} ---`);
            /*console.log('Raw Variables:', {
                purchasePrice: order?.purchasePrice || "no purchase price",
                weight,
                quantity,
                totalPrice,
                categoryTitle: category?.title || 'No title',
                categoryNameSecond: category?.categoryNameSecond || 'No categoryNameSecond',
                categoryType: category?.type || 'No type',
                deliveryMode: order.deliveryMode
            });*/ 

            // Get commission from Memory Map (Instant lookup)
            let categoryComission = 10;
            if (category?.title && categoryCommissionMap.has(category.title)) {
                categoryComission = categoryCommissionMap.get(category.title);
                //console.log(`  Category commission found: ${categoryComission}%`);
            } else {
                //console.log(`  No commission data found for category: ${category.title}, using default: ${categoryComission}%`);
            }

            // Commission is based on Total Price, so it naturally scales with quantity already
            const productComission = 1.16 * Math.ceil((categoryComission / 100) * totalPrice);

            let tireType = 'CAR_TIRES';
            const isTire = category?.categoryNameSecond === 'Шины';
            tireType = category?.type || tireType;

            // Delivery cost is calculated based on total weight/price for the whole order
            const kaspiDeliveryCost = 1.16 * this.getDeliveryCost({
                productPrice: totalPrice,
                weight,
                tireType,
                isTire,
                deliveryMode: order.deliveryMode
            });

            // --- CORRECTED FORMULA ---
            // totalPrice: Total Revenue (Already scaled by quantity)
            // (purchasePrice * quantity): Total Cost of Goods (Scales with quantity)
            // productComission: Total Commission (Scales with totalPrice)
            // kaspiDeliveryCost: Total Shipping (Fixed per order, does NOT scale with quantity)
            let profit = 0;

            if (typeof taxRegime !== 'number' || taxRegime <= 0) {
                profit = totalPrice - ((purchasePrice * quantity) + productComission + kaspiDeliveryCost);
            } else if (taxRegime === 20) {
                const profitBeforeTax = totalPrice - ((purchasePrice * quantity) + productComission + kaspiDeliveryCost);
                profit = profitBeforeTax * 0.8;
            } else {
                const taxCut = totalPrice * (taxRegime / 100);
                profit = totalPrice - ((purchasePrice * quantity) + productComission + kaspiDeliveryCost + taxCut);
            }
           

            /*console.log('Calculated Costs:', {
                categoryComission,
                productComission,
                kaspiDeliveryCost: Math.ceil(kaspiDeliveryCost),
                profit,
                totalAccumulatedValue: value + profit
            }); */ 

            value += profit;
        } catch (orderError) {
            console.error(`  Error processing order ${order.orderId}:`, orderError);
            continue;
        }
    }

    //console.log('--- STORE PROFIT CALCULATION END ---');
    //console.log('Final Result:', { value, percentageDifference: 0, isPurchasePrice });

    return {
        value,
        percentageDifference: 0,
        isPurchasePrice,
    };
}
    private getDeliveryCost({
        productPrice,
        isTire,
        tireType,
        weight,
        deliveryMode,
    }: {
        productPrice: number
        isTire: boolean
        tireType: string
        weight: number
        deliveryMode: string
    }) {
        //console.log(`  [getDeliveryCost] Inputs:`, { productPrice, isTire, tireType, weight, deliveryMode });

        let deliveryCost = 0

        if (productPrice < 1000) {
            deliveryCost = 49.14;
        }
        else if (productPrice >= 1000 && productPrice < 3000) {
            deliveryCost = 149.14;
        }
        else if (productPrice >= 3000 && productPrice < 5000) {
            deliveryCost = 199.14;
        }
        else if (productPrice >= 5000 && productPrice < 10000) {
            if (deliveryMode === 'DELIVERY_LOCAL') {
                deliveryCost = 699.14;
            } else {
                deliveryCost = 799.14;
            }
        }
        else {
            if (isTire) {
                if (tireType === 'CAR_TIRES') {
                    if (deliveryMode === 'DELIVERY_LOCAL') deliveryCost = 1049.14;
                    else if (deliveryMode === 'DELIVERY_REGIONAL_TODOOR') deliveryCost = 1649.14;
                    else if (deliveryMode === 'DELIVERU_EXPRESS') deliveryCost = 1349.14;
                }
                else if (tireType === 'TRUCK_TIRES') {
                    if (deliveryMode === 'DELIVERY_LOCAL') deliveryCost = 4199.14;
                    else if (deliveryMode === 'DELIVERY_REGIONAL_TODOOR') deliveryCost = 6049.14;
                    else if (deliveryMode === 'DELIVERU_EXPRESS') deliveryCost = 5749.14;
                }
            }
            else {
                if (weight < 5) {
                    if (deliveryMode === 'DELIVERY_LOCAL') deliveryCost = 1099.14;
                    else if (deliveryMode === 'DELIVERY_REGIONAL_TODOOR') deliveryCost = 1299.14;
                    else if (deliveryMode === 'DELIVERU_EXPRESS') deliveryCost = 1699.14;
                }
                else if (weight >= 5 && weight < 15) {
                    if (deliveryMode === 'DELIVERY_LOCAL') deliveryCost = 1349.14;
                    else if (deliveryMode === 'DELIVERY_REGIONAL_TODOOR') deliveryCost = 1699.14;
                    else if (deliveryMode === 'DELIVERU_EXPRESS') deliveryCost = 1849.14;
                }
                else if (weight >= 15 && weight < 30) {
                    if (deliveryMode === 'DELIVERY_LOCAL') deliveryCost = 2299.14;
                    else if (deliveryMode === 'DELIVERY_REGIONAL_TODOOR') deliveryCost = 3599.14;
                    else if (deliveryMode === 'DELIVERU_EXPRESS') deliveryCost = 3149.14;
                }
                else if (weight >= 30 && weight < 60) {
                    if (deliveryMode === 'DELIVERY_LOCAL') deliveryCost = 2899.14;
                    else if (deliveryMode === 'DELIVERY_REGIONAL_TODOOR') deliveryCost = 5649.14;
                    else if (deliveryMode === 'DELIVERU_EXPRESS') deliveryCost = 3599.14;
                }
                else if (weight >= 60 && weight < 100) {
                    if (deliveryMode === 'DELIVERY_LOCAL') deliveryCost = 4149.14;
                    else if (deliveryMode === 'DELIVERY_REGIONAL_TODOOR') deliveryCost = 8549.14;
                    else if (deliveryMode === 'DELIVERU_EXPRESS') deliveryCost = 5599.14;
                }
                else {
                    if (deliveryMode === 'DELIVERY_LOCAL') deliveryCost = 6449.14;
                    else if (deliveryMode === 'DELIVERY_REGIONAL_TODOOR') deliveryCost = 11999.14;
                    else if (deliveryMode === 'DELIVERU_EXPRESS') deliveryCost = 8449.14;
                }
            }
        }

        //console.log(`  [getDeliveryCost] Result: ${deliveryCost}`);
        return deliveryCost;
    }
    public async getStoreTurnover(storeId: Types.ObjectId, fromDate: Date, toDate: Date) {
        console.log(fromDate, toDate)

        const data = await this.orderModel.aggregate([
            {
                $match: {
                    storeId,
                    creationDate: {
                        $gte: fromDate,
                        $lte: toDate,
                    },
                    status: {
                        $ne: 'CANCELLED',
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    turnover: {
                        $sum: '$totalPrice',
                    },
                },
            },
        ])

        if (data.length === 0) {
            return {
                value: 0,
                percentageDifference: 0,
            }
        }

        return {
            value: data[0]?.turnover || 0,
            percentageDifference: 0,
        }
    }

    public async getAverageAmountOfSells(storeId: Types.ObjectId, fromDate: Date, toDate: Date, filter: string) {
        const orders = await this.orderModel
            .find({
                storeId,
                status: {
                    $ne: 'CANCELLED',
                },
                creationDate: {
                    $gte: fromDate,
                    $lte: toDate,
                },
            })
            .select({
                totalPrice: 1,
            })

        const totalSales = orders.map((order) => order.totalPrice)
        totalSales.sort((a, b) => a - b)

        const count = totalSales.length
        let median

        if (count % 2 === 0) {
            median = (totalSales[count / 2 - 1] + totalSales[count / 2]) / 2
        } else {
            median = totalSales[Math.floor(count / 2)]
        }

        return {
            value: median,
            percentageDifference: 0,
        }
    }

    public async getTopCity(storeId: Types.ObjectId, fromDate: Date, toDate: Date) {
        const orders = await this.orderModel.find({
            storeId,
            creationDate: { $gte: fromDate, $lte: toDate },
            status: { $ne: 'CANCELLED' },
        })

        const cityCounts = {}
        for (const order of orders) {
            let city = order.town
            if (!city || city === 'Нет') {
                if (order.deliveryMode === 'DELIVERY_PICKUP') {
                    const pickupPoint = await this.kaspiStorePickupPointModel.findOne({
                        storeId: storeId,
                        displayName: order.addressDisplayName,
                    })
                    if (pickupPoint && pickupPoint.cityName) {
                        city = pickupPoint.cityName
                    }
                }
            }
            if (!city) {
                city = 'Неизвестный город'
            }

            cityCounts[city] = (cityCounts[city] || 0) + 1
        }
        let topCity = null
        let maxCount = 0
        Object.entries(cityCounts).forEach(([key, value]) => {
            const count = typeof value === 'number' ? value : 0
            if (count > maxCount) {
                maxCount = count
                topCity = key
            }
        })
        return { value: topCity ?? '' }
    }

    public async getReturnOrderStats(storeId: Types.ObjectId, fromDate: Date, toDate: Date) {
        const data = await this.orderModel.aggregate([
            {
                $match: {
                    storeId,
                    creationDate: {
                        $gte: fromDate,
                        $lte: toDate,
                    },
                    status: 'RETURNED',
                },
            },
            {
                $group: {
                    _id: null,
                    turnover: {
                        $sum: '$totalPrice',
                    },
                },
            },
        ])

        if (data.length === 0) {
            return {
                value: 0,
                percentageDifference: 0,
            }
        }

        return {
            value: data[0]?.turnover || 0,
            percentageDifference: 0,
        }
    }

    public async getAmountOfSells(storeId: Types.ObjectId, fromDate: Date, toDate: Date) {
        const data = await this.orderModel.aggregate([
            {
                $match: {
                    storeId,
                    creationDate: {
                        $gte: fromDate,
                        $lte: toDate,
                    },
                    status: {
                        $ne: 'CANCELLED',
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    amountOfSells: {
                        $sum: 1,
                    },
                },
            },
        ])

        if (data.length === 0) {
            return {
                value: 0,
                percentageDifference: 0,
            }
        }

        return {
            value: data[0]?.amountOfSells || 0,
            percentageDifference: 0,
        }
    }

    public async getChart(storeId: Types.ObjectId, fromDate: Date, toDate: Date, filter: string) {
        const orders = await this.orderModel
            .find({
                storeId,
                status: {
                    $ne: 'CANCELLED',
                },
                creationDate: {
                    $gte: fromDate,
                    $lte: toDate,
                },
            })
            .select({
                creationDate: 1,
                quantity: 1,
                totalPrice: 1,
            })

        const profit = 0
        let totalPrice = 0
        const ordersPer = {}
        let totalDays = 0
        const dayDifference = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 3600 * 24))
        let keyFormat = filter
        if (filter === 'today' || filter === 'yesterday') {
            keyFormat = 'hour'
        } else if (filter === 'week' || filter === 'rangeData') {
            keyFormat = 'day'
        } else if (filter === 'month') {
            if (dayDifference <= 30) {
                keyFormat = 'day'
            }
        }
        const months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сент', 'Окт', 'Ноя', 'Дек']

        for (const order of orders) {
            let key = ''

            if (keyFormat === 'hour') {
                key = `${order.creationDate.getHours()}`.padStart(2, '0')
            } else if (keyFormat === 'day') {
                key = `${order.creationDate.getDate()} ${months[order.creationDate.getMonth()]} ${order.creationDate.getFullYear()}`
            } else if (keyFormat === 'month') {
                key = `${months[order.creationDate.getMonth()]} ${order.creationDate.getFullYear()}`
            }

            if (!ordersPer[key]) {
                ordersPer[key] = {
                    amountOfSells: 0,
                    turnover: 0,
                }
            }
            ordersPer[key].amountOfSells += order.quantity
            ordersPer[key].turnover += order.totalPrice
            totalPrice += order.totalPrice
        }

        if (keyFormat === 'today') {
            totalDays = new Date().getHours() + 1
        } else if (keyFormat === 'yesterday') {
            totalDays = 24
        } else {
            totalDays = Object.keys(ordersPer).length
        }

        const result = {
            totalOrders: orders.length,
            orders: ordersPer,
            profit: profit,
            totalPrice: totalPrice,
            soldPerDay: ((orders.length * 1.0) / (totalDays * 1.0)).toFixed(1),
        }

        return result
    }

    public async getOrderByCode(token: string, orderCode: string) {
        const store = await this.orderApiTokenModel.findOne({ token })

        if (!store) {
            throw new UnauthorizedException()
        }

        const storeId = store.storeId

        const order = await this.orderModel.findOne({ storeId, orderCode })
        if (!order) {
            throw new NotFoundException()
        }

        new this.getOrderDetailsModel({
            storeId,
            orderCode,
        })
            .save()
            .catch((e) => {
                console.log('[^]' + ' order.service ' + ' | ' + new Date() + ' | ' + '\n' + e);
            })

        const ordertEntries = await this.orderProductEntryModel.find({ orderId: order.orderId })
        const entries = []
        for (const ordertEntry of ordertEntries) {
            const product = await this.productService.getProductByStoreIdAndMasterProductSku(ordertEntry.productCode, storeId.toString())
            if (!product) {
                continue
            }

            entries.push({
                sku: product.sku,
                productCode: ordertEntry.productCode,
                totalPrice: ordertEntry.totalPrice,
                basePrice: ordertEntry.basePrice,
                quantity: ordertEntry.quantity,
                productName: ordertEntry.productName,
            })
        }

        const storePickupPoint = await this.storeService.getStorePickupPoint(storeId.toString(), order.addressDisplayName)

        return {
            orderCode: order.orderCode,
            totalPrice: order.totalPrice,
            customerFirstName: order.customerFirstName,
            customerLastName: order.customerLastName,
            customerPhone: order.customerPhone,
            deliveryAddress: order.deliveryAddress,
            deliveryCost: order.deliveryCost,
            state: order.state,
            status: order.status,
            creationDate: order.creationDate,
            quantity: order.quantity,
            town: order.town,
            completedDate: order.completedDate,
            pickupPointAddress: storePickupPoint?.formattedAddress || null,
            entries,
        }
    }

    public async getOrdersList(
        token: string,
        options: {
            page: number
            limit: number
            startDate?: string
            endDate?: string
        }
    ): Promise<{ orders: { orderCode: string; creationDate: Date; state: string; status: string }[]; totalCount: number }> {
        const store = await this.orderApiTokenModel.findOne({ token })

        if (!store) {
            throw new UnauthorizedException()
        }
        const storeId = store.storeId

        const whereQuery: any = { storeId }

        if (!options.startDate) {
            throw new BadRequestException('Missing startDate')
        }

        const startDate = new Date(parseInt(options.startDate, 10))
        if (isNaN(startDate.getTime())) {
            throw new BadRequestException('Invalid startDate')
        }

        whereQuery.status = {
            $ne: "CANCELLED"
        }

        whereQuery.creationDate = {
            $gte: startDate,
        }

        let endDate: Date
        if (!options.endDate) {
            endDate = new Date() // Нынешняя дата
        } else {
            endDate = new Date(parseInt(options.endDate, 10))
            if (isNaN(endDate.getTime())) {
                throw new BadRequestException('Invalid endDate')
            }
        }

        // Проверка на интервал не более недели
        const maxInterval = 7 * 24 * 60 * 60 * 1000 // 7 дней в миллисекундах
        const timeDifference = endDate.getTime() - startDate.getTime()
        if (timeDifference > maxInterval) {
            throw new BadRequestException('The time interval between startDate and endDate should not exceed 7 days.')
        }

        whereQuery.creationDate.$lte = endDate

        if (isNumber(options.limit) && options.limit > 100) {
            options.limit = 100
        }

        const orders: OrderModel[] = await this.orderModel
            .find(whereQuery)
            .sort({
                creationDate: -1,
            })
            .skip((options.page - 1) * options.limit)
            .limit(options.limit)

        const formattedOrders = orders.map((order) => ({
            orderCode: order.orderCode,
            creationDate: order.creationDate,
            state: order.state,
            status: order.status,
        }))

        const totalCount: number = await this.orderModel.count(whereQuery)

        return { orders: formattedOrders, totalCount }
    }

    public async getStoreOrdersCount(storeId: string) {
        try {
            const ordersResult = await this.orderModel.aggregate([
                {
                    $match: {
                        storeId: new Types.ObjectId(storeId),
                        status: { $ne: "CANCELLED" }
                    }
                },
                {
                    $group: {
                        _id: {
                            state: '$state',
                            subState: { $ifNull: ['$subState', null] },
                        },
                        count: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        state: '$_id.state',
                        subState: '$_id.subState',
                        count: {
                            $cond: {
                                if: { $gte: ['$count', 100] },
                                then: '99+',
                                else: { $toString: '$count' },
                            },
                        },
                        _id: 0,
                    },
                },
            ])
            const refundsResult = await this.getStoreRefundsCount(storeId)
            const result = [...ordersResult, ...refundsResult]
            result.forEach((item) => {
                if (item.state === 'KASPI_DELIVERY' && item.subState !== null) {
                    item.state = item.subState
                }
            })

            // Добавляем подсчет для фильтра ALL (все заказы)
            const totalOrdersCount = await this.orderModel.count({
                storeId: new Types.ObjectId(storeId),
                status: { $ne: 'CANCELLED' }
            })

            result.push({
                state: 'ALL',
                subState: null,
                count: totalOrdersCount >= 100 ? '99+' : totalOrdersCount.toString()
            })

            return result
        } catch (error) {
            // console.error('Error while getting store orders count:', error)
            console.error('[!]' + ' order.service ' + ' | ' + 'Error while getting store orders count' + ' | ' + new Date() + ' | ' + '\n' + error);

            throw error
        }
    }

    public async getStoreOrders(options: GetStoreOrdersOptionsType) {
        // await this.validateOrderStatusAccess(options.storeId)
        // let subState = null
        // if (options.state.includes('KASPI_DELIVERY')) {
        //     subState = options.state
        //     options.state = 'KASPI_DELIVERY'
        // }
        const query: QueryOptions = {
            storeId: new Types.ObjectId(options.storeId),
            state: options.state,
        }
        // if (subState) {
        //     query.subState = subState
        // }

        // Для фильтра ALL не устанавливаем конкретный state
        if (options.state !== 'ALL') {
            query.state = options.state
        } else {
            // Удаляем state из query для фильтра ALL
            delete query.state
        }

        if (options.town !== null) {
            query.originCity = options.town
        }
        options.query = (options.query || '').trim()

        if (options.dateFrom && options.dateTo) {
            const dateFrom = new Date(options.dateFrom)
            const dateTo = new Date(options.dateTo)
            dateTo.setDate(dateTo.getDate() + 1)

            query.creationDate = {
                $gte: new Date(dateFrom),
                $lt: new Date(dateTo),
            }
        }

        if (options.query) {
            // Regex поиск по конкретным полям
            const searchRegex = new RegExp(options.query, 'i')
            query.$or = [
                { customerPhone: { $regex: searchRegex } },
                { customerFirstName: { $regex: searchRegex } },
                { customerLastName: { $regex: searchRegex } },
                { orderCode: { $regex: searchRegex } }
            ]
        }
        query.status = { $ne: 'CANCELLED' }
        const orders = await this.orderModel.aggregate([
            {
                $match: query,
            },
            {
                $sort: {
                    creationDate: -1,
                },
            },
            {
                $skip: (options.page - 1) * options.limit,
            },
            {
                $limit: options.limit,
            },
            // {
            //     $lookup: {
            //         from: 'OrderImage',
            //         as: 'images',
            //         localField: '_id',
            //         foreignField: 'orderId',
            //         pipeline: [
            //             {
            //                 $project: {
            //                     fileName: 1,
            //                     _id: 1,
            //                     imageUrl: {
            //                         $concat: [`/api/order/order-image/`, '$fileName'],
            //                     },
            //                 },
            //             },
            //         ],
            //     },
            // },
            {
                $project: {
                    orderId: 1,
                    orderCode: 1,
                    totalPrice: 1,
                    quantity: 1,
                    productName: 1,
                    customerFirstName: 1,
                    customerLastName: 1,
                    customerPhone: 1,
                    creationDate: 1,
                    status: 1,
                    state: 1,
                    deliveryAddress: 1,
                    deliveryMode: 1,
                    deliveryCost: 1,
                    //images: 1,
                    products: 1,
                    comment: 1,
                    paymentMode: 1,
                    plannedDeliveryDate: 1,
                    isKaspiDelivery: 1,
                    signatureRequired: 1,
                    preOrder: 1,
                    pickupPoint: 1,
                    dateToAccept: 1,
                    apiToken: 1,
                    kaspiDelivery: 1,
                    courier: 1,
                    courierTrackingLink: 1,
                    cancellationDate: 1,
                    cancellationReasonCode: 1,
                    actualDeliveryDate: 1,
                    taplinkSent: 1,
                    orderInfoSent: 1,
                    reviewsSent: 1,
                },
            },
        ])

        const totalCount = await this.orderModel.aggregate([
            {
                $match: query,
            },
            {
                $group: {
                    _id: null,
                    totalCount: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                },
            },
        ])
        return {
            orders,
            totalCount,
        }
    }

    public async getStoreSSOrders(options: GetStoreSSOrdersOptionsType) {
        await this.validateOrderStatusAccess(options.storeId)
        let subState = null
        if (options.state.includes('KASPI_DELIVERY')) {
            subState = options.state
            options.state = 'KASPI_DELIVERY'
        }
        const query: QueryOptions = {
            storeId: new Types.ObjectId(options.storeId),
            state: options.state,
        }
        if (subState) {
            query.subState = subState
        }
        if (options.town !== null) {
            query.originCity = options.town
        }

        if (options.dateFrom && options.dateTo) {
            const dateFrom = new Date(options.dateFrom)
            const dateTo = new Date(options.dateTo)
            dateTo.setDate(dateTo.getDate() + 1)

            query.creationDate = {
                $gte: new Date(dateFrom),
                $lt: new Date(dateTo),
            }
        }

        query.fromSSTap = true

        const orders = await this.orderModel.aggregate([
            {
                $match: query
            },
            {
                $sort: {
                    creationDate: -1
                }
            },
            {
                $skip: (options.page - 1) * options.limit
            },
            {
                $limit: options.limit
            },
            {
                $unwind: "$products"
            },
            {
                $lookup: {
                    from: "Product",
                    localField: "products.sku",
                    foreignField: "sku",
                    as: "productDetails",
                    pipeline: [
                        {
                            $match: {
                                isActive: true
                            }
                        }
                    ]
                }
            },
            {
                $unwind: "$productDetails"
            },
            {
                $group: {
                    _id: "$_id",
                    customerFirstName: { $first: "$customerFirstName" },
                    totalPrice: { $first: "$totalPrice" },
                    creationDate: { $first: "$creationDate" },
                    deliveryAddress: { $first: "$deliveryAddress" },
                    customerPhone: { $first: "$customerPhone" },
                    products: {
                        $push: {
                            sku: "$products.sku",
                            name: "$productDetails.name",
                            quantity: "$products.quantity",
                            price: "$products.price",
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    orderId: "$_id",
                    customerFirstName: "$customerFirstName",
                    customerPhone: "$customerPhone",
                    totalPrice: "$totalPrice",
                    creationDate: "$creationDate",
                    deliveryAddress: "$deliveryAddress",
                    products: 1
                }
            }
        ])

        // console.log(orders)

        const totalCount = await this.ssTapOrderModel.aggregate([
            {
                $match: query,
            },
            {
                $group: {
                    _id: null,
                    totalCount: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                },
            },
        ])
        return {
            orders,
            totalCount,
        }
    }

    public async getStorePickupCities(storeId: string) {
        const towns = await this.kaspiStorePickupPointModel.aggregate([
            {
                $match: {
                    storeId: new Types.ObjectId(storeId),
                },
            },
            {
                $group: {
                    _id: '$cityName',
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ])
        return towns
    }

    public async getOrdersId(storeId: string, town?: string) {
        const query: QueryOptions = {
            storeId: new Types.ObjectId(storeId),
            state: 'NEW',
        }
        if (town !== null) {
            query.originCity = town
        }
        const orders = await this.orderModel.aggregate([
            {
                $match: query,
            },
            {
                $sort: {
                    creationDate: -1,
                },
            },
            {
                $project: {
                    orderCode: 1,
                    orderId: 1,
                },
            },
        ])
        return orders
    }

    public async generateInvoices(storeId: string, dto: string[]) {
        const store = await this.storeService.getStoreById(storeId)

        if (!store) {
            throw new NotFoundException("Store not found")
        }

        const url = `https://mc.shop.kaspi.kz/mc/api/order/cargo/assembled?_m=${store.storeId}`

        const body = {
            cargos: dto.map(async (orderId) => {
                const order = await this.orderModel.findOne({ _id: new Types.ObjectId(orderId) })

                if (!order) {
                    throw new NotFoundException("Order not found")
                }

                return {
                    newCargoSpace: 1,
                    orderCode: order.orderCode,
                    quantity: order.quantity
                }
            })
        }

        const headers = {
            cookie: store.cookie,
            'User-Agent': store.userAgent,
        }

        const proxy = await this.proxyService.getRandomProxy("MERCHANTCABINET")

        const httpsAgent = this.proxyService.getHttpsAgent(proxy)

        const response = await axios.post(url, body, { headers, httpsAgent }).catch((error) => {
            throw new Error(error)
        })

        if (response.status !== 200) {
            throw new Error(response.data)
        }

        return "ok"
    }

    public async getInvoices(storeId: string, printerType: string, dto: string[], res: Response) {
        if (dto.length > 16) {
            throw new BadRequestException("Orders amount should be less than 16 orders")
        }

        const store = await this.storeService.getStoreById(storeId)

        if (!store) {
            throw new NotFoundException("Store not found")
        }

        const files = dto.map(async (orderId) => {
            const attempts = 5

            for (let attempt = 0; attempt < attempts; attempt++) {
                try {
                    const order = await this.orderModel.findOne({ _id: new Types.ObjectId(orderId) })

                    const url = `https://mc.shop.kaspi.kz/mc/api/merchant/kaspi-delivery/waybill/?orderCode=${order.orderCode}&_m=${store.storeId}`

                    const headers = {
                        cookie: store.cookie,
                        'User-Agent': store.userAgent,
                    }

                    const proxy = await this.proxyService.getRandomProxy("MERCHANTCABINET")

                    const httpsAgent = this.proxyService.getHttpsAgent(proxy)

                    const response = await axios.get(url, { responseType: 'arraybuffer', headers, httpsAgent }).catch((error) => {
                        throw new Error(error)
                    })

                    // const filePath = `${order.orderCode}-${new Date().getTime()}.pdf`

                    // fs.writeFileSync(filePath, response.data);

                    return response.data
                } catch (error) {
                    console.log(error)
                }
            }
        })

        const outputPdf = await PDFDocument.create();

        // Load each PDF and crop & compile its content
        const rowCount = printerType === "common" ? Math.ceil(Math.sqrt(files.length)) : files.length;
        const colCount = printerType === "common" ? rowCount : 1;
        const pageWidth = 600;
        const pageHeight = printerType === "common" ? 800 : 800 * files.length;
        const cellWidth = pageWidth / colCount;
        const cellHeight = pageHeight / rowCount;

        console.log(rowCount, colCount, pageWidth, pageHeight, cellWidth, cellHeight)

        const outputPage = outputPdf.addPage([pageWidth, pageHeight]);

        for (let i = 0; i < files.length; i++) {
            // Load the source PDF
            const pdfBytes = await files[i]
            const sourcePdf = await PDFDocument.load(pdfBytes);

            // Assume each source PDF has one page
            const sourcePage = sourcePdf.getPages()[0];
            const { width, height } = sourcePage.getSize();

            // Define crop box (only top-left corner of each page)
            const cropBoxWidth = width / 2;
            const cropBoxHeight = height / 2;

            // Embed the page into the output PDF
            const embeddedPage = await outputPdf.embedPage(sourcePage, {
                left: 0,
                bottom: height - cropBoxHeight,
                right: cropBoxWidth,
                top: height,
            });

            // Scale and add to grid layout
            const row = Math.floor(i / colCount);
            const col = i % colCount;

            const x = col * cellWidth;
            const y = pageHeight - (row + 1) * cellHeight;

            outputPage.drawPage(embeddedPage, {
                x,
                y,
                width: cellWidth,
                height: cellHeight,
            });
        }

        // Serialize the final PDF and save to file
        const pdfBytes = await outputPdf.save();

        res.setHeader('Content-Type', 'application/pdf');

        console.log(`${store.name}-${new Date().toISOString()}.pdf`)

        res.setHeader(
            'Content-Disposition',
            `attachment; filename="generated.pdf"`,
        );

        res.status(200).send(Buffer.from(pdfBytes))
        // fs.writeFileSync(outputFilePath, pdfBytes);
    }

    public async acceptAllOrders(storeId: string, town?: string) {
        try {
            const orders = await this.getOrdersId(storeId, town)
            const store = await this.storeService.getStoreById(storeId)
            if (!orders) {
                throw new NotFoundException()
            }
            orders.forEach(async (order) => {
                await this.acceptOrDeclineOrder(true, order.orderId, order.orderCode, null, store.apiToken, store.storeId)
            })
            return { error: false, message: 'Мы успешно приняли все ваши заказы!' }
        } catch (e) {
            throw new Error(e)
        }
    }

    public async acceptOrDeclineOrder(
        accept: boolean,
        orderId: string,
        orderCode: string,
        storeId?: string,
        token?: string,
        merchantId?: string,
        cancelReason?: string
    ) {
        if (!token) {
            const store = await this.storeService.getStoreById(storeId)
            token = store.apiToken
            merchantId = store.storeId
        }

        try {
            const url = `https://kaspi.kz/shop/api/v2/orders`
            const headers = {
                'X-Auth-Token': token,
                'Content-Type': 'application/vnd.api+json',
                'X-Merchant-Uid': merchantId,
            }
            const body = accept
                ? {
                    data: {
                        type: 'orders',
                        id: orderId,
                        attributes: {
                            status: 'ACCEPTED_BY_MERCHANT',
                        },
                    },
                }
                : {
                    data: {
                        type: 'orders',
                        id: orderId,
                        attributes: {
                            status: 'CANCELLED',
                            cancellationReason: cancelReason ?? 'BUYER_CANCELLATION_BY_MERCHANT',
                        },
                    },
                }
            const proxy = await this.proxyService.getRandomProxyForSales()
            const proxyOpts = parse(proxy.proxy)
            proxyOpts.auth = `${proxy.login}:${proxy.password}`
            const agent = new HttpsProxyAgent(proxyOpts)
            const response = await axios.post(url, body, {
                headers: headers,
                httpsAgent: agent,
            })
            if (response.status >= 200 && response.status < 300) {
                //add order to the queue
                //await this.updateOrderState(orderCode)
                return response.data
            }
            return { error: true, message: 'Что-то пошло не так' }
        } catch (e) {
            console.error('[!]' + ' order.service ' + ' | ' + new Date() + ' | ' + '\n' + e);
            throw e
        }
    }

    public async orderIssuing(
        sendCode: boolean,
        orderId: string,
        securityCode: number,
        storeId?: string,
        token?: string,
        merchantId?: string
    ) {
        if (!token) {
            const store = await this.storeService.getStoreById(storeId)
            token = store.apiToken
            merchantId = store.storeId
        }

        try {
            const url = `https://kaspi.kz/shop/api/v2/orders`
            let headers = {}
            if (sendCode) {
                headers = {
                    'X-Auth-Token': token,
                    'Content-Type': 'application/vnd.api+json',
                    'X-Merchant-Uid': merchantId,
                    'X-Send-Code': true,
                }
            } else {
                headers = {
                    'X-Auth-Token': token,
                    'Content-Type': 'application/vnd.api+json',
                    'X-Merchant-Uid': merchantId,
                    'X-Security-Code': securityCode,
                }
            }

            const body = {
                data: {
                    type: 'orders',
                    id: orderId,
                    attributes: {
                        status: 'COMPLETED',
                    },
                },
            }
            const proxy = await this.proxyService.getRandomProxyForSales()
            const proxyOpts = parse(proxy.proxy)
            proxyOpts.auth = `${proxy.login}:${proxy.password}`
            const agent = new HttpsProxyAgent(proxyOpts)
            const response = await axios.post(url, body, {
                headers: headers,
                httpsAgent: agent,
            })
            if (response.status >= 200 && response.status < 300) {
                //add order to the queue
                //await this.updateOrderState(orderCode)
                return response.data
            }
            return { error: true, message: 'Что-то пошло не так' }
        } catch (e) {
            console.error('[!]' + ' order.service ' + ' | ' + new Date() + ' | ' + '\n' + e);
            throw e
        }
    }

    public async getOrderEntries(orderCode: string) {
        const order = await this.orderModel.findOne({ orderCode })
        if (!order) {
            throw new NotFoundException()
        }

        await this.validateOrderStatusAccess(order.storeId.toString())

        const orderEntries = await this.orderProductEntryModel.find({ orderCode })

        const result = []
        for (const orderEntry of orderEntries) {
            const productImageUrl = await this.getProductImageUrl(orderEntry.productCode)

            const images = await this.orderProductEntryImageModel.find({ orderProductEntryId: orderEntry._id }).select({ fileName: 1 })

            result.push({
                productName: orderEntry.productName,
                productCode: orderEntry.productCode,
                categoryName: orderEntry?.category?.name || '',
                totalPrice: orderEntry.totalPrice,
                quantity: orderEntry.quantity,
                basePrice: orderEntry.basePrice,
                images: images.map((image) => {
                    return {
                        _id: image._id,
                        imageUrl: `/api/order/order-entry-image/${image.fileName}`,
                        fileName: image.fileName,
                    }
                }),
                comment: orderEntry.comment,
                barCode: orderEntry.barCode,
                productImageUrl,
            })
        }

        return result
    }

    public async getProductImageUrl(masterSku: string): Promise<string | null> {
        const productImageUrlKey = `productImageUrl:${masterSku}`

        const data = await this.redisClient.get(productImageUrlKey)
        if (data) {
            return data
        }

        const productImage = await this.productService.getProductImage(masterSku)
        if (productImage) {
            await this.redisClient.set(productImageUrlKey, productImage, { EX: 12 * 60 * 60 })

            return productImage
        }

        return null
    }

    public async saveOrderEntries(storeId: string, orderCode: string, orderEntries: any[]) {
        await this.validateOrderStatusAccess(storeId)

        const order = await this.orderModel.exists({ storeId, orderCode })
        if (!order) {
            throw new NotFoundException()
        }

        for (const orderEntry of orderEntries) {
            if (!orderEntry.productCode) {
                throw new BadRequestException()
            }
            const exists = await this.orderProductEntryModel.exists({ orderCode, productCode: orderEntry.productCode })
            if (!exists) {
                continue
            }

            await this.orderProductEntryModel.updateOne(
                {
                    _id: exists._id,
                },
                {
                    barCode: orderEntry.barCode,
                    comment: orderEntry.comment,
                }
            )
        }
    }

    public async saveOrderEntryImage(storeId: string, orderCode: string, productCode: string, file: Express.Multer.File) {
        await this.validateOrderStatusAccess(storeId)

        const order = await this.orderModel.exists({ storeId, orderCode })
        if (!order) {
            throw new NotFoundException()
        }
        const exists = await this.orderProductEntryModel.exists({ orderCode, productCode })
        if (!exists) {
            throw new NotFoundException()
        }

        const imagesCount = await this.orderProductEntryImageModel.count({ orderProductEntryId: exists._id })
        if (imagesCount >= 3) {
            throw new BadRequestException()
        }

        await new this.orderProductEntryImageModel({
            orderProductEntryId: exists._id,
            fileName: `${orderCode}-${productCode}-${new Date().getTime()}.${file.mimetype.split('/')[1]}`,
            imageBuffer: file.buffer,
            size: file.size,
        }).save()
    }

    public async saveOrderImage(storeId: string, orderCode: string, file: Express.Multer.File) {
        await this.validateOrderStatusAccess(storeId)

        const order = await this.orderModel.exists({ storeId, orderCode })
        if (!order) {
            throw new NotFoundException()
        }

        const imagesCount = await this.orderImageModel.count({ orderId: order._id })
        if (imagesCount >= 5) {
            throw new BadRequestException()
        }

        const data = await new this.orderImageModel({
            orderId: order._id,
            fileName: `${orderCode}-${new Date().getTime()}.${file.mimetype.split('/')[1]}`,
            imageBuffer: file.buffer,
            size: file.size,
        }).save()

        return {
            _id: data._id,
            imageUrl: `/api/order/order-image/${data.fileName}`,
            fileName: data.fileName,
        }
    }

    public async getOrderEntryImage(fileName: string) {
        return this.orderProductEntryImageModel.findOne({ fileName })
    }

    public async getOrderImage(fileName: string) {
        return this.orderImageModel.findOne({ fileName })
    }

    public async deleteOrderEntryImage(orderEntryImageId: string) {
        await this.orderProductEntryImageModel.deleteOne({ _id: orderEntryImageId })
    }

    public async deleteOrderImage(orderImageId: string) {
        await this.orderImageModel.deleteOne({ _id: orderImageId })
    }

    public async validateOrderStatusAccess(storeId: string) {
        const store = await this.storeService.getStoreById(storeId)
        if (!store) {
            throw new NotFoundException()
        }

        if (store.apiToken && store.expireDate > new Date() && store.merchantOrderAccess) {
            return
        }

        throw new BadRequestException()
    }

    public async updateOrder(userId: string, orderCode: string, dto: UpdateOrderDto) {
        const order = await this.orderModel.findOne({ orderCode })
        if (!order) {
            throw new NotFoundException()
        }

        const stores = await this.storeService.getStoresByQuery({ userId })
        for (const store of stores) {
            if (store._id.toString() === order.storeId.toString()) {
                await this.orderModel.updateOne({ _id: order._id }, { comment: dto.comment })

                return
            }
        }

        throw new NotFoundException()
    }

    public async updateOrderState(orderCode: string) {
        try {
            await this.orderModel.updateOne({ orderCode: orderCode }, { state: 'TEMP' })
            return
        } catch (e) {
            throw new NotFoundException()
        }
    }

    public async getExcel(res: Response, storeId: string, filterFromDate: string, filterToDate: string, cityId: string, tab: string) {
        const store = await this.storeService.getStoreById(storeId)
        if (!store) {
            return
        }
        if (cityId != 'null') {
            const city = await this.storeService.getCityIdByName(cityId)
            cityId = city.id
        }

        // console.log(cityId)

        for (let attempt = 0; attempt < 5; attempt++) {
            try {
                const proxy = await this.proxyService.getRandomProxy()

                const proxyOpts = parse(proxy.proxy)
                proxyOpts.auth = `${proxy.login}:${proxy.password}`
                const agent = new HttpsProxyAgent(proxyOpts)

                const url = `https://kaspi.kz/merchantcabinet/api/order/exportToExcel?orderStatus=null&searchTerm=&cityId=${cityId}&filterFromDate=${filterFromDate}&filterToDate=${filterToDate}&orderTab=${tab}`
                // console.log(url)
                const response = await axios.get(url, {
                    headers: this.proxyService.getHeaders(store.cookie),
                    httpsAgent: agent,
                    timeout: 300000,
                    responseType: 'arraybuffer',
                })
                if (response.status == 200) {
                    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
                    res.setHeader('Content-Disposition', 'attachment; filename="filename.xlsx"')

                    res.send(response.data)
                    return
                }
            } catch (e) {
                console.error('[!]' + ' order.service ' + ' | ' + new Date() + ' | ' + '\n' + e);
                throw new InternalServerErrorException('Ошибка сервера')
            }
        }
    }

    public async getStoreRefundsByState(storeId: string, state: string) {
        return await this.refundModel.find({ refundTab: state })
    }

    public async getStoreRefunds(options: GetStoreOrdersOptionsType) {
        await this.validateOrderStatusAccess(options.storeId)

        const query: any = {
            storeId: options.storeId,
            refundTab: options.state,
        }

        options.query = (options.query || '').trim()

        if (options.query) {
            query.applicationNumber = options.query
        }

        const orders = await this.refundModel.aggregate([
            {
                $match: query,
            },
            {
                $sort: {
                    createdDate: -1,
                },
            },
            {
                $lookup: {
                    from: 'Product',
                    as: 'productName',
                    localField: 'productSku',
                    foreignField: 'masterProduct.sku',
                    pipeline: [
                        {
                            $project: {
                                _id: 0,
                                name: 1,
                            },
                        },
                    ],
                },
            },
            {
                $addFields: {
                    productName: {
                        $ifNull: [{ $arrayElemAt: ['$productName.name', 0] }, 'Товар не найден'],
                    },
                },
            },
            {
                $skip: (options.page - 1) * options.limit,
            },
            {
                $limit: options.limit,
            },
        ])

        const totalCount = await this.refundModel.aggregate([
            {
                $match: query,
            },
            {
                $group: {
                    _id: null,
                    totalCount: { $sum: 1 },
                },
            },
            {
                $project: {
                    _id: 0,
                },
            },
        ])

        return {
            orders,
            totalCount,
        }
    }

    public async getStoreRefundsCount(storeId: string) {
        try {
            const result = await this.refundModel.aggregate([
                {
                    $match: { storeId: storeId },
                },
                {
                    $group: {
                        _id: {
                            state: '$refundTab',
                            subState: { $ifNull: ['$subState', null] },
                        },
                        count: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        state: '$_id.state',
                        subState: '$_id.subState',
                        count: {
                            $cond: {
                                if: { $gte: ['$count', 100] },
                                then: '99+',
                                else: { $toString: '$count' },
                            },
                        },
                        _id: 0,
                    },
                },
                {
                    $addFields: {
                        state: {
                            $cond: {
                                if: { $eq: ['$state', 'NEW'] },
                                then: 'NEW_REFUNDS',
                                else: '$state',
                            },
                        },
                    },
                },
            ])

            return result
        } catch (error) {
            // console.error('Error while getting store orders count:', error)
            console.error('[!]' + ' order.service ' + ' | ' + 'Error while getting store orders count' + ' | ' + new Date() + ' | ' + '\n' + error);
            throw error
        }
    }

    public async getRefundEntries(applicationNumber: string) {
        const order = await this.refundModel.findOne({ applicationNumber })
        if (!order) {
            throw new NotFoundException()
        }

        await this.validateOrderStatusAccess(order.storeId.toString())

        const refundEntries = await this.refundModel.find({ applicationNumber })

        const result = []
        for (const orderEntry of refundEntries) {
            result.push({
                customerName: orderEntry.customerName,
                customerPhone: orderEntry.customerPhone,
                productName: 'название продукта',
                productPrice: orderEntry.productPrice,
                quantity: orderEntry.quantity,
                productSku: orderEntry.productSku,
                deliveryType: orderEntry.deliveryType,
                reason: orderEntry.refundReason.reason || '',
                reasonDescription: orderEntry.refundReason.reasonDescription || '',
            })
        }

        return result
    }

    public async sendOrderPinCode(storeId: string, orderId: string) {
        const order = await this.ssTapOrderModel.findOne({ _id: orderId, storeId })

        if (!order) {
            throw new NotFoundException("Заказ не найден")
        }

        const code = Math.floor(1000 + Math.random() * 8999).toString()

        console.log(`Code ${code} sent to +${order?.customerPhone}`)
        const url = "https://api.salescout.me/api/whatsapp/send-message"

        // console.log(order?.customerPhone)

        const body = {
            "number": order?.customerPhone,
            "message": "Ваш код подтверждения: " + code
        }

        await axios.post(url, body).then(() => {
            console.log(`Code successfully sent to +${order?.customerPhone}`)
            this.redisClient.set(`orderPinCode:${orderId}`, code, { EX: 60 * 10 })
        }).catch(err => {
            console.log('[^]' + ' order.service ' + ' | ' + new Date() + ' | ' + '\n' + err);
        })

        return "OK"
    }

    public async verifyPhoneNumber(dto: VerifyOrderRecievingDto) {
        const { pin, orderId } = dto

        console.log("Verifying")
        const code = await this.redisClient.get(`orderPinCode:${orderId}`)

        // console.log(code, pin)

        if (code === pin) {
            console.log(`Code ${pin} verified for order ${orderId}`)
            return "OK"
        } else {
            throw new BadRequestException('Неверный код подтверждения')
        }
    }

    public async completeOrder(orderId: string) {
        const order = await this.ssTapOrderModel.findOne({ _id: orderId })
        // console.log(order)
        if (!order) {
            throw new NotFoundException()
        }

        await this.ssTapOrderModel.updateOne({ _id: new Types.ObjectId(orderId) }, { state: 'ARCHIVE', completedDate: new Date() })
    }

    public async createOrder(dto: CreateOrder) {
        const lastOrder = await this.orderModel.findOne({ customerPhone: dto.customerPhone })

        let customerFirstName = ""
        let customerLastName = ""

        if (lastOrder) {
            customerFirstName = lastOrder.customerFirstName
            customerLastName = lastOrder.customerLastName
        }

        console.log("Creating order")

        this.orderModel.create({
            orderId: new Types.ObjectId().toString(),
            totalPrice: dto.amount,
            customerPhone: dto.customerPhone,
            storeId: new Types.ObjectId(dto.storeId),
            state: 'NEW',
            subState: "",
            status: "",
            deliveryAddress: dto.deliveryAddress,
            deliveryCost: 0,
            deliveryMode: 'DELIVERY_PICKUP',
            products: dto.products,
            customerFirstName,
            customerLastName,
            creationDate: new Date(),
            completedDate: null,
            productName: "",
            town: "750000000",
            orderCode: "sstap",
            productCode: "sstap",
            productId: "sstap",
            quantity: 0,
            url: "sstap",
            apiToken: "",
            fromSSTap: true,
        }).then(() => console.log("Order created")).catch((e) => {
            console.error('[!]' + ' order.service ' + ' | ' + new Date() + ' | ' + '\n' + e);
        })

    }

    public async getOrdersCount(storeId: string) {
        try {
            // console.log(storeId)
            const ordersResult = await this.ssTapOrderModel.aggregate([
                {
                    $match: { storeId: new Types.ObjectId(storeId) },
                },
                {
                    $group: {
                        _id: {
                            state: '$state',
                        },
                        count: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        state: '$_id.state',
                        count: {
                            $cond: {
                                if: { $gte: ['$count', 100] },
                                then: '99+',
                                else: { $toString: '$count' },
                            },
                        },
                        _id: 0,
                    },
                },
            ])

            const result: { [key: string]: number } = {}
            for (const filter of ordersResult) {
                result[filter.state] = +filter.count
            }
            // console.log(result)
            return result
        } catch (error) {
            console.error('Error while getting store orders count:', error)
            console.error('[!]' + ' order.service ' + ' | ' + ' Error while getting store orders count ' + ' | ' + new Date() + ' | ' + '\n' + error);
            throw error
        }
    }

    public async getOrdersHistoryByProductSku(storeId: string, sku: string, startDate: string, endDate: string) {
        if (!isValidObjectId(storeId)) {
            throw new NotFoundException(STORE_NOT_FOUND_ERROR)
        }

        const product = await this.productModel.findOne({
            storeId: new Types.ObjectId(storeId),
            sku
        })

        if (!product) {
            return new NotFoundException(PRODUCT_NOT_FOUND_ERROR)
        }

        // console.log(new Date(startDate))
        // console.log(new Date(endDate))

        const orders = this.orderModel.aggregate(
            [
                {
                    $match: {
                        storeId: new Types.ObjectId(storeId),
                        productCode: product.masterProduct.sku,
                        creationDate: {
                            $gte: new Date(startDate),
                            $lte: new Date(endDate),
                        }
                    }
                },
                {
                    $project: {
                        y: { $year: "$creationDate" },
                        m: { $month: "$creationDate" },
                        d: { $dayOfMonth: "$creationDate" },
                        h: { $hour: "$creationDate" },
                    }
                },
                {
                    $group: {
                        _id: {
                            year: { $substr: ["$y", 0, 4] },
                            month: {
                                $cond: {
                                    if: {
                                        $eq: [
                                            { $strLenCP: { $substr: ["$m", 0, 2] } },
                                            2
                                        ]
                                    },
                                    then: { $substr: ["$m", 0, 2] },
                                    else: {
                                        $concat: [
                                            "0",
                                            { $substr: ["$m", 0, 2] }
                                        ]
                                    }
                                },
                            },
                            day: {
                                $cond: {
                                    if: {
                                        $eq: [
                                            { $strLenCP: { $substr: ["$d", 0, 2] } },
                                            2
                                        ]
                                    },
                                    then: { $substr: ["$d", 0, 2] },
                                    else: {
                                        $concat: [
                                            "0",
                                            { $substr: ["$d", 0, 2] }
                                        ]
                                    }
                                },
                            },
                            hour: "$h"
                        },
                        total: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        date: { $concat: ["$_id.year", "/", "$_id.month", "/", "$_id.day"] },
                        hour: "$_id.hour",
                        total: 1,
                        _id: 0
                    }
                },
                {
                    $sort: {
                        date: 1,
                        hour: 1,

                    }
                },
            ]
        )

        return orders
    }

    public async notifyMerchantAboutNewOrder(job: {
        storeId: string,
        amount: number,
        products: any[],
        customerPhone: string,
        deliveryAddress: string
    }) {
        let message = `🔥🔥🔥\nПокупатель оплатил заказ через SSTap 🤑\nДанные заказа на SaleScout: https://app.salescout.me/merchant/${job.storeId}/orders\n\n`
        message += `Это технический номер SaleScout.me. Мы здесь не отвечаем 🤐\n\n`
        message += `Пишите нам в любое время по номеру wa.me/77089623410 🤗`

        const store = await this.storeService.getStoreById(job.storeId)
        const user = await this.userService.findUserById(store.userId.toString())

        if (!user) {
            return
        }

        const body = {
            "number": user.email.replace("+", ''),
            "message": message
        }

        const url = "https://api.salescout.me/api/whatsapp/send-message"

        await axios.post(url, body).then(() => {
            console.log(`Message successfully sent to ${user.email}`)
        }).catch(err => {
            console.log('[^]' + ' order.service ' + ' | ' + new Date() + ' | ' + '\n' + err);
        })
    }
}
