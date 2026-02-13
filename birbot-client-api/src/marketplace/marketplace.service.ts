import { Injectable } from '@nestjs/common';

@Injectable()
export class MarketplaceService {
  async findOne(id: string) {
    // Stub: Return Kaspi marketplace for now
    return {
      _id: id,
      name: 'Kaspi',
      key: 'KASPI',
      slug: 'kaspi',
    };
  }

  async getMarketplace(id: string) {
    return this.findOne(id);
  }

  async isExists(id: string): Promise<boolean> {
    return true;
  }
}