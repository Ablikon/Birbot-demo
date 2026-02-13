import { TypegooseModuleOptions } from 'nestjs-typegoose'

export const getMainMongoConfig = async (): Promise<TypegooseModuleOptions> => {
    const db = process.env.MAIN_MONGO_CONNECT_URL || ''

    return {
        uri: db,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
}


export const getTechMongoConfig = async (): Promise<TypegooseModuleOptions> => {
    const db = process.env.TECH_MONGO_CONNECT_URL || process.env.MAIN_MONGO_CONNECT_URL || ''

    return {
        uri: db,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
}

export const getAnalyticsMongoConfig = async (): Promise<TypegooseModuleOptions> => {
    const db = process.env.ANALYTICS_MONGO_CONNECT_URL || process.env.MAIN_MONGO_CONNECT_URL || ''

    return {
        uri: db,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }
}
