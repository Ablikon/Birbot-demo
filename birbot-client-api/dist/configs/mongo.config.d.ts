import { TypegooseModuleOptions } from 'nestjs-typegoose';
export declare const getMainMongoConfig: () => Promise<TypegooseModuleOptions>;
export declare const getTechMongoConfig: () => Promise<TypegooseModuleOptions>;
export declare const getAnalyticsMongoConfig: () => Promise<TypegooseModuleOptions>;
