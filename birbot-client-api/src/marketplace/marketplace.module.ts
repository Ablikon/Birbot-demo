import { Module } from '@nestjs/common';
import { MarketplaceService } from './marketplace.service';

@Module({
  providers: [MarketplaceService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}