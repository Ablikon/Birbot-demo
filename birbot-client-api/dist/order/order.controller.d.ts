/// <reference types="cookie-parser" />
/// <reference types="multer" />
/// <reference types="mongoose/types/aggregate" />
/// <reference types="mongoose/types/callback" />
/// <reference types="mongoose/types/collection" />
/// <reference types="mongoose/types/connection" />
/// <reference types="mongoose/types/cursor" />
/// <reference types="mongoose/types/document" />
/// <reference types="mongoose/types/error" />
/// <reference types="mongoose/types/expressions" />
/// <reference types="mongoose/types/helpers" />
/// <reference types="mongoose/types/middlewares" />
/// <reference types="mongoose/types/indexes" />
/// <reference types="mongoose/types/models" />
/// <reference types="mongoose/types/mongooseoptions" />
/// <reference types="mongoose/types/pipelinestage" />
/// <reference types="mongoose/types/populate" />
/// <reference types="mongoose/types/query" />
/// <reference types="mongoose/types/schemaoptions" />
/// <reference types="mongoose/types/schematypes" />
/// <reference types="mongoose/types/session" />
/// <reference types="mongoose/types/types" />
/// <reference types="mongoose/types/utility" />
/// <reference types="mongoose/types/validation" />
/// <reference types="mongoose/types/virtuals" />
/// <reference types="mongoose" />
/// <reference types="mongoose/types/inferschematype" />
import { NotFoundException } from '@nestjs/common';
import { ActionService } from 'src/action/action.service';
import { OrderService } from './order.service';
import { Request, Response } from 'express';
import { UpdateOrderDto } from './dto/update-order.dto';
import { VerifyOrderRecievingDto } from 'src/store/dto/verify-order-recieving.dto';
export declare class OrderController {
    private readonly orderService;
    private readonly actionService;
    constructor(orderService: OrderService, actionService: ActionService);
    getStatisticsLast24Hours(): Promise<any>;
    getStatisticsLastMonth(): Promise<any>;
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
    getFirstOrderDate(storeId: string): Promise<{
        firstOrderDate: Date | null;
    }>;
    stats(): Promise<{
        count: number;
        sum: number;
    }>;
    getOrderByCode(orderCode: string, req: Request): Promise<{
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
    getOrdersList(page: number, limit: number, startDate: string, endDate: string, req: Request): Promise<{
        orders: {
            orderCode: string;
            creationDate: Date;
            state: string;
            status: string;
        }[];
        totalCount: number;
    }>;
    getStorePickupCities(storeId: string): Promise<any[]>;
    getStoreOrdersCount(storeId: string): Promise<any[]>;
    getOrderStatsByStoreId(storeId: string, filter: string, startDate: Date, endDate: Date, userId: string): Promise<{
        totalOrders: number;
        orders: {};
        profit: number;
        totalPrice: number;
        soldPerDay: string;
    }>;
    saveOrderEntries(orderCode: string, storeId: string, orderEntries: any[]): Promise<void>;
    getOrderEntryImage(fileName: string, res: Response): Promise<void>;
    getOrderImage(fileName: string, res: Response): Promise<void>;
    deleteOrderEntryImage(orderEntryImageId: string): Promise<void>;
    deleteOrderImage(orderEntryImageId: string): Promise<void>;
    saveOrderEntryImage(file: Express.Multer.File, orderCode: string, storeId: string, productCode: string): Promise<void>;
    saveOrderImage(file: Express.Multer.File, orderCode: string, storeId: string): Promise<{
        _id: import("mongoose").Types.ObjectId;
        imageUrl: string;
        fileName: string;
    }>;
    getOrderEntries(orderCode: string): Promise<any[]>;
    getStoreOrders(storeId: string, state: string, q: string, page: string, limit: string, town: string, dateFrom: string, dateTo: string): Promise<{
        orders: any[];
        totalCount: any[];
    }>;
    acceptAllOrders(storeId: string, town: string): Promise<{
        error: boolean;
        message: string;
    }>;
    acceptOrder(storeId: string, orderId: string, orderCode: string, accept: boolean, cancelReason: string): Promise<any>;
    orderIssuing(storeId: string, orderId: string, securityCode: number | null, sendCode: boolean): Promise<any>;
    generateInvoices(storeId: string, dto: string[]): Promise<string>;
    getInvoices(storeId: string, printerType: string, dto: string[], res: Response): Promise<void>;
    getProductOrders(productId: string, userId: string): Promise<(import("mongoose").Document<import("mongoose").Types.ObjectId, import("@typegoose/typegoose/lib/types").BeAnObject, any> & import("./order.model").OrderModel & import("@typegoose/typegoose/lib/types").IObjectWithTypegooseFunction & Required<{
        _id: import("mongoose").Types.ObjectId;
    }>)[]>;
    getProductOrdersHistory(storeId: string, productId: string, filterFromDate: string, filterToDate: string): Promise<any[] | NotFoundException>;
    sleep(ms: number): Promise<unknown>;
    updateOrder(orderCode: string, dto: UpdateOrderDto, userId: string): Promise<void>;
    getExcel(storeId: string, state: string, cityId: string, filterFromDate: string, filterToDate: string, res: Response): Promise<void>;
    getStoreRefunds(storeId: string, state: string, query: string, page: string, limit: string, town: string): Promise<{
        orders: any[];
        totalCount: any[];
    }>;
    getStoreRefundsCount(storeId: string): Promise<any[]>;
    getRefundEntries(applicationNumber: string): Promise<any[]>;
    sendStoreCode(storeId: string, orderId: string, userId: string): Promise<string>;
    verifyPhoneNumber(dto: VerifyOrderRecievingDto, userId: string): Promise<string>;
    completeOrder(orderId: string): Promise<void>;
    getSSOrdersCount(storeId: string): Promise<{
        [key: string]: number;
    }>;
    getStoreSSOrders(storeId: string, state: string, page: string, limit: string, town: string, dateFrom: string, dateTo: string): Promise<{
        orders: any[];
        totalCount: any[];
    }>;
}
