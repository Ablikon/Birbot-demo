export declare class MarketplaceService {
    findOne(id: string): Promise<{
        _id: string;
        name: string;
        key: string;
        slug: string;
    }>;
    getMarketplace(id: string): Promise<{
        _id: string;
        name: string;
        key: string;
        slug: string;
    }>;
    isExists(id: string): Promise<boolean>;
}
