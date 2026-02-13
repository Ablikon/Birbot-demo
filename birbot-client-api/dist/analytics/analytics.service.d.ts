export declare class AnalyticsService {
    calculateProfit(productCode: string, totalPrice: number): Promise<{
        delivery: {
            priceWithNDS: number;
        }[];
        comission: number;
    }>;
    getProductBySku(sku: string): Promise<any>;
}
