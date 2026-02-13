/// <reference types="multer" />
import { NotFoundException } from '@nestjs/common';
import { OrderModel } from './order.model';
import { ModelType } from '@typegoose/typegoose/lib/types';
import mongoose, { Types } from 'mongoose';
import { StoreService } from 'src/store/store.service';
import { ProductService } from 'src/product/product.service';
import { BestSellingProductDto } from './dto/best-selling-product.dto';
import { GetOrderDetailsModel } from './get-order-details-history.model';
import { OrderApiTokenModel } from './order-api-token.model';
import { OrderProductEntryModel } from './order-product-entry.model';
import { OrderProductEntryImageModel } from './order-product-entry-image.model';
import { OrderImageModel } from './order-image.model';
import { UpdateOrderDto } from './dto/update-order.dto';
import { KaspiStorePickupPointModel } from 'src/store/kaspi-store-pickup-point.model';
import { KaspiCategoryComissionService } from '../kaspi-category-comission/kaspi-category-comission.service';
import { ProxyService } from 'src/proxy/proxy.service';
import { RefundModel } from './refund.model';
import { ProductModel } from 'src/product/product.model';
import { Response } from 'express';
import { SSTapOrderModel } from './ss-tap-order.model';
import { VerifyOrderRecievingDto } from 'src/store/dto/verify-order-recieving.dto';
import { UserService } from 'src/user/user.service';
export type GetStoreOrdersOptionsType = {
    storeId: string;
    state: string;
    page: number;
    limit: number;
    query: string;
    town?: string;
    dateFrom?: string;
    dateTo?: string;
};
export type GetStoreSSOrdersOptionsType = {
    storeId: string;
    state: string;
    page: number;
    limit: number;
    town?: string;
    dateFrom?: string;
    dateTo?: string;
};
interface CreateOrder {
    storeId: Types.ObjectId;
    amount: number;
    products: {
        sku: string;
        price: number;
        quantity: number;
    }[];
    customerPhone: string;
    deliveryAddress: string;
}
export declare class OrderService {
    private readonly orderModel;
    private readonly ssTapOrderModel;
    private readonly kaspiStorePickupPointModel;
    private readonly orderImageModel;
    private readonly orderProductEntryModel;
    private readonly orderProductEntryImageModel;
    private readonly getOrderDetailsModel;
    private readonly orderApiTokenModel;
    private readonly refundModel;
    private readonly productModel;
    private readonly kaspiCategoryComissionService;
    private readonly storeService;
    private readonly productService;
    private readonly proxyService;
    private readonly userService;
    private readonly redisClient;
    constructor(orderModel: ModelType<OrderModel>, ssTapOrderModel: ModelType<SSTapOrderModel>, kaspiStorePickupPointModel: ModelType<KaspiStorePickupPointModel>, orderImageModel: ModelType<OrderImageModel>, orderProductEntryModel: ModelType<OrderProductEntryModel>, orderProductEntryImageModel: ModelType<OrderProductEntryImageModel>, getOrderDetailsModel: ModelType<GetOrderDetailsModel>, orderApiTokenModel: ModelType<OrderApiTokenModel>, refundModel: ModelType<RefundModel>, productModel: ModelType<ProductModel>, kaspiCategoryComissionService: KaspiCategoryComissionService, storeService: StoreService, productService: ProductService, proxyService: ProxyService, userService: UserService);
    getStatusesReport(storeId: string): Promise<{
        newAndSignRequiredCount: {
            totalPrice: number;
            count: number;
        };
        pickupCount: {
            totalPrice: number;
            count: number;
        };
        deliveryCount: {
            totalPrice: number;
            count: number;
        };
        kaspiDeliveryCount: {
            totalPrice: number;
            count: number;
        };
    }>;
    getFirstOrderDate(storeId: string): Promise<Date | null>;
    getBestSellingProducts(limit?: number): Promise<BestSellingProductDto[]>;
    getOrderStatsByStoreId(storeId: string, filter?: string, startDateFromWeb?: Date, endDateFromWeb?: Date): Promise<{
        totalOrders: number;
        orders: {};
        profit: number;
        totalPrice: number;
        soldPerDay: string;
    }>;
    private getStartDate;
    getOrdersStattisticsLast24Hours(): Promise<any>;
    getOrdersStattisticsLastMonth(): Promise<any>;
    getOrderStatisctics(minusDay?: number, type?: string): Promise<{
        total: number;
        launchStores: number;
        today: number;
        todayTotalSum: number;
    }>;
    getTopSellingProducts(storeId: string, filter?: string, limit?: number): Promise<any[]>;
    getTopSellingProductsByTotalPrice(storeId: string, filter?: string, limit?: number): Promise<any[]>;
    getTop5PoorlySellingProducts(storeId: string): Promise<any[]>;
    getTop5LowSellingCities(storeId: string, filter?: string): Promise<any[]>;
    getTop5SellingCities(storeId: string, filter?: string, limit?: number): Promise<any[]>;
    getProductOrders(productId: string): Promise<(mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & OrderModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getOrdersInfo(sku: string, date: Date): Promise<{
        numberOfOrdersPerDay: number;
        numberOfOurSellersPerDay: number;
        turnoverInOneDay: number;
    }>;
    getStoreProfit(storeId: Types.ObjectId, fromDate: Date, toDate: Date): Promise<{
        value: number;
        percentageDifference: number;
        isPurchasePrice: boolean;
    }>;
    private getDeliveryCost;
    getStoreTurnover(storeId: Types.ObjectId, fromDate: Date, toDate: Date): Promise<{
        value: any;
        percentageDifference: number;
    }>;
    getAverageAmountOfSells(storeId: Types.ObjectId, fromDate: Date, toDate: Date, filter: string): Promise<{
        value: any;
        percentageDifference: number;
    }>;
    getTopCity(storeId: Types.ObjectId, fromDate: Date, toDate: Date): Promise<{
        value: any;
    }>;
    getReturnOrderStats(storeId: Types.ObjectId, fromDate: Date, toDate: Date): Promise<{
        value: any;
        percentageDifference: number;
    }>;
    getAmountOfSells(storeId: Types.ObjectId, fromDate: Date, toDate: Date): Promise<{
        value: any;
        percentageDifference: number;
    }>;
    getChart(storeId: Types.ObjectId, fromDate: Date, toDate: Date, filter: string): Promise<{
        totalOrders: number;
        orders: {};
        profit: number;
        totalPrice: number;
        soldPerDay: string;
    }>;
    getOrderByCode(token: string, orderCode: string): Promise<{
        orderCode: string;
        totalPrice: number;
        customerFirstName: string;
        customerLastName: string;
        customerPhone: string;
        deliveryAddress: string;
        deliveryCost: number;
        state: string;
        status: string;
        creationDate: Date;
        quantity: number;
        town: string;
        completedDate: Date;
        pickupPointAddress: string;
        entries: any[];
    }>;
    getOrdersList(token: string, options: {
        page: number;
        limit: number;
        startDate?: string;
        endDate?: string;
    }): Promise<{
        orders: {
            orderCode: string;
            creationDate: Date;
            state: string;
            status: string;
        }[];
        totalCount: number;
    }>;
    getStoreOrdersCount(storeId: string): Promise<any[]>;
    getStoreOrders(options: GetStoreOrdersOptionsType): Promise<{
        orders: any[];
        totalCount: any[];
    }>;
    getStoreSSOrders(options: GetStoreSSOrdersOptionsType): Promise<{
        orders: any[];
        totalCount: any[];
    }>;
    getStorePickupCities(storeId: string): Promise<any[]>;
    getOrdersId(storeId: string, town?: string): Promise<any[]>;
    generateInvoices(storeId: string, dto: string[]): Promise<string>;
    getInvoices(storeId: string, printerType: string, dto: string[], res: Response): Promise<void>;
    acceptAllOrders(storeId: string, town?: string): Promise<{
        error: boolean;
        message: string;
    }>;
    acceptOrDeclineOrder(accept: boolean, orderId: string, orderCode: string, storeId?: string, token?: string, merchantId?: string, cancelReason?: string): Promise<any>;
    orderIssuing(sendCode: boolean, orderId: string, securityCode: number, storeId?: string, token?: string, merchantId?: string): Promise<any>;
    getOrderEntries(orderCode: string): Promise<any[]>;
    getProductImageUrl(masterSku: string): Promise<string | null>;
    saveOrderEntries(storeId: string, orderCode: string, orderEntries: any[]): Promise<void>;
    saveOrderEntryImage(storeId: string, orderCode: string, productCode: string, file: Express.Multer.File): Promise<void>;
    saveOrderImage(storeId: string, orderCode: string, file: Express.Multer.File): Promise<{
        _id: Types.ObjectId;
        imageUrl: string;
        fileName: string;
    }>;
    getOrderEntryImage(fileName: string): Promise<mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & OrderProductEntryImageModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    getOrderImage(fileName: string): Promise<mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & OrderImageModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>>;
    deleteOrderEntryImage(orderEntryImageId: string): Promise<void>;
    deleteOrderImage(orderImageId: string): Promise<void>;
    validateOrderStatusAccess(storeId: string): Promise<void>;
    updateOrder(userId: string, orderCode: string, dto: UpdateOrderDto): Promise<void>;
    updateOrderState(orderCode: string): Promise<void>;
    getExcel(res: Response, storeId: string, filterFromDate: string, filterToDate: string, cityId: string, tab: string): Promise<void>;
    getStoreRefundsByState(storeId: string, state: string): Promise<(mongoose.Document<Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & RefundModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: Types.ObjectId;
    }>)[]>;
    getStoreRefunds(options: GetStoreOrdersOptionsType): Promise<{
        orders: any[];
        totalCount: any[];
    }>;
    getStoreRefundsCount(storeId: string): Promise<any[]>;
    getRefundEntries(applicationNumber: string): Promise<any[]>;
    sendOrderPinCode(storeId: string, orderId: string): Promise<string>;
    verifyPhoneNumber(dto: VerifyOrderRecievingDto): Promise<string>;
    completeOrder(orderId: string): Promise<void>;
    createOrder(dto: CreateOrder): Promise<void>;
    getOrdersCount(storeId: string): Promise<{
        [key: string]: number;
    }>;
    getOrdersHistoryByProductSku(storeId: string, sku: string, startDate: string, endDate: string): Promise<any[] | NotFoundException>;
    notifyMerchantAboutNewOrder(job: {
        storeId: string;
        amount: number;
        products: any[];
        customerPhone: string;
        deliveryAddress: string;
    }): Promise<void>;
}
export {};
