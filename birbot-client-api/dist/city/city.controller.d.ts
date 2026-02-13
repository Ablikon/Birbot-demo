import { CityService } from './city.service';
export declare class CityController {
    private readonly cityService;
    constructor(cityService: CityService);
    getCities(marketplaceKey: string): Promise<{
        id: any;
        name: string;
    }[]>;
}
