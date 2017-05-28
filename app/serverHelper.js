const q = require('q');
const winston = require('winston');
const logger = require('winston');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const serverHelper = module.exports = {};

serverHelper.setupExceptionHandling = function (mainConfig) {
    process.on('uncaughtException', (ex) => {
        logger.error(`Uncaught exception ${ex}`);
        process.exit(1);
    });

    return q(mainConfig);
};

serverHelper.checkEnvs = function (mainConfig) {
    const requiredEnv = [
        'MONGO_URL'
    ];

    if (!process.env.LOGGING_LEVEL) {
        process.env.LOGGING_LEVEL = 'warn';
    }

    requiredEnv.forEach(serverHelper.checkEnv);

    return q(mainConfig);
};

serverHelper.checkEnv = function (envName) {
    if (!process.env[envName]) {
        logger.log('error', `${envName} environment variable is not set`);
        process.exit(1);
    }
};

serverHelper.setupLogging = function (mainConfig) {
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, { level: process.env.LOGGING_LEVEL, timestamp: true });
    return q(mainConfig);
};

serverHelper.loadConfig = function (mainConfig) {
    // Load configurations
    dotenv.load();
    // Set the node env variable if not set before
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    return q(mainConfig);
};

serverHelper.setupDatabaseConnection = function (mainConfig) {
    const deferred = q.defer();
    logger.info('Opening mongodb connection');
    const db = mongoose.connect(process.env.MONGO_URL, (err) => {
        if (err) {
            logger.error('Unable to connect at startup, exiting', err);
            deferred.resolve(mainConfig);
        }
    });

    mongoose.connection.on('open', () => {
        logger.info('Mongoose: open');
        mainConfig.db = db;
        deferred.resolve(mainConfig);
    });

    mongoose.connection.on('error', (err) => {
        logger.error(`Mongoose: ${err} exiting`);
    });

    mongoose.connection.on('disconnected', (err) => {
        logger.log('Mongoose: disconnected, exiting', err);
    });

    return deferred.promise;
};
