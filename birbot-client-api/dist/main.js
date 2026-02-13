"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
process.env.TZ = 'Asia/Qyzylorda';
const dotenv = require('dotenv');
dotenv.config({
    path: '.env',
});
const env = process.env.ENVIRONMENT || 'prod';
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const swagger_1 = require("@nestjs/swagger");
const common_1 = require("@nestjs/common");
const express_1 = require("express");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const httpAdapter = app.getHttpAdapter();
    if (httpAdapter && typeof httpAdapter.getInstance === 'function') {
        const expressApp = httpAdapter.getInstance();
        if (expressApp && typeof expressApp.set === 'function') {
            expressApp.set('trust proxy', true);
        }
    }
    app.enableCors({
        maxAge: 0,
    });
    app.use((0, express_1.json)({ limit: '5mb' }));
    app.use((0, express_1.urlencoded)({ extended: true, limit: '5mb' }));
    app.use(customCors);
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
    }));
    if (env !== 'prod') {
        const config = new swagger_1.DocumentBuilder()
            .setTitle('SaleScout.me')
            .setDescription('Swagger for service SaleScout.me')
            .setVersion('1.1')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, config);
        swagger_1.SwaggerModule.setup('swagger', app, document);
    }
    const PORT = env === 'prod' ? 30080 : 8081;
    await app.listen(PORT, '0.0.0.0');
}
bootstrap();
const customCors = (_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PATCH, DELETE');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
};
//# sourceMappingURL=main.js.map