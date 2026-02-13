import { Controller, Get, NotFoundException, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import { AppService } from './app.service'
import { JwtAuthGuard } from './auth/guards/jwt.guard'
import { existsSync } from 'fs'
import { ApiTags } from '@nestjs/swagger'
import { MarketplaceCityModel } from './city/marketplace-city.model'
import { InjectModel } from 'nestjs-typegoose'
import { Model } from 'mongoose'
import * as path from 'path'
import * as fs from 'fs';

@Controller()
@ApiTags('Constants')
export class AppController {
    constructor(
        private readonly appService: AppService,
        @InjectModel(MarketplaceCityModel) private readonly marketplaceCityModel: Model<MarketplaceCityModel>
    ) {}

    @Get('kaspi/cities')
    @UseGuards(JwtAuthGuard)
    async getKaspiCities() {
        return await this.marketplaceCityModel.find().select({ id: 1, name: 1 })
    }

    @Get('kaspi/manager/step-1')
    async getKaspiManagerStep1(@Res() res: Response) {
        const path = './src/assets/kaspi-manager/step-1.jpeg'

        if (!existsSync) {
            throw new NotFoundException()
        }

        res.download(path)
    }

    @Get('kaspi/manager/step-2')
    async getKaspiManagerStep2(@Res() res: Response) {
        const path = './src/assets/kaspi-manager/step-2.jpeg'

        if (!existsSync) {
            throw new NotFoundException()
        }

        res.download(path)
    }

    @Get('create-heapdump')
    async getMemoryUsage(@Res() res: Response) {
        const filePath = await this.appService.getMemoryUsage();
        const fileName = path.basename(filePath);

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    }   
}
