export declare class ProductMerchantService {
    getProductMerchant(sku: string, cityId: string): Promise<{
        _id: any;
        sku: string;
        cityId: string;
        price: number;
        masterProductSku: string;
        productUrl: string;
        isX2Check: boolean;
    }>;
}
