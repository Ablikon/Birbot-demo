"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalyticsMongoConfig = exports.getTechMongoConfig = exports.getMainMongoConfig = void 0;
const getMainMongoConfig = async () => {
    const db = process.env.MAIN_MONGO_CONNECT_URL || '';
    return {
        uri: db,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };
};
exports.getMainMongoConfig = getMainMongoConfig;
const getTechMongoConfig = async () => {
    const db = process.env.TECH_MONGO_CONNECT_URL || process.env.MAIN_MONGO_CONNECT_URL || '';
    return {
        uri: db,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };
};
exports.getTechMongoConfig = getTechMongoConfig;
const getAnalyticsMongoConfig = async () => {
    const db = process.env.ANALYTICS_MONGO_CONNECT_URL || process.env.MAIN_MONGO_CONNECT_URL || '';
    return {
        uri: db,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    };
};
exports.getAnalyticsMongoConfig = getAnalyticsMongoConfig;
//# sourceMappingURL=mongo.config.js.map