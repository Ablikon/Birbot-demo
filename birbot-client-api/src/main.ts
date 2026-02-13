process.env.TZ = 'Asia/Qyzylorda'

const dotenv = require('dotenv')
dotenv.config({
    path: '.env',
})
const env = process.env.ENVIRONMENT || 'prod'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { ValidationPipe } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { urlencoded, json } from 'express'
//import { Logger } from './logger/logger.service'

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    
    // Настраиваем trust proxy для правильного определения IP адреса клиента
    // Это позволяет Express правильно обрабатывать заголовки x-forwarded-for
    const httpAdapter = app.getHttpAdapter()
    if (httpAdapter && typeof httpAdapter.getInstance === 'function') {
        const expressApp = httpAdapter.getInstance()
        if (expressApp && typeof expressApp.set === 'function') {
            expressApp.set('trust proxy', true)
        }
    }
    
    app.enableCors({
        maxAge: 0,
    })
    app.use(json({ limit: '5mb' }))
    app.use(urlencoded({ extended: true, limit: '5mb' }))
    app.use(customCors)
    app.setGlobalPrefix('api')
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
        })
    )
    if (env !== 'prod') {
        const config = new DocumentBuilder()
            .setTitle('SaleScout.me')
            .setDescription('Swagger for service SaleScout.me')
            .setVersion('1.1')
            .build()

        const document = SwaggerModule.createDocument(app, config)
        SwaggerModule.setup('swagger', app, document)
    }

    const PORT = env === 'prod' ? 30080 : 8081
    await app.listen(PORT, '0.0.0.0')

    // process.on('uncaughtException', (error: Error) => {
    //     console.error('Uncaught Exception:', error);
    //     Logger.log({ message: error.message.toString(), status: 'error' });
    //     process.exit(1);
    // });

    // process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    //     console.error('Unhandled Rejection:', reason);
    //     Logger.log({ message: reason.message, status: 'error' });
    //     process.exit(1);
    // });
}
bootstrap()

const customCors = (_req: Request, res: Response, next: NextFunction): void => {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, DELETE')
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')

    next()
}
