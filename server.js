const main = module.exports = {};
const q = require('q');
const _ = require('lodash');
const express = require('express');
const path = require('path');
const winston = require('winston');
const logger = require('winston');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

const migrationService = require('./app/migration/migrationService');

    /**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

main.start = _.once(() => {
    const mainConfig = {};
    return main.setupExceptionHandling(mainConfig)
        .then(main.setupLogging)
        .then(main.loadConfig)
        .then(main.checkEnvs)
        .then(main.setupDatabaseConnection)
        .then(main.applyMigrations)
        .then(main.setupHTTP).then(() => {
            logger.info('Started system successfully');
        }, (err) => {
            logger.log('error', err.message, err.stack);
            process.exit(1);
        });
});

main.setupExceptionHandling = function (mainConfig) {
    process.on('uncaughtException', (ex) => {
        logger.error(`Uncaught exception ${ex}`);
        process.exit(1);
    });

    return q(mainConfig);
};

main.checkEnvs = function (mainConfig) {
    const requiredEnv = [
        'MONGO_URL'
    ];

    if (!process.env.LOGGING_LEVEL) {
        process.env.LOGGING_LEVEL = 'warn';
    }

    requiredEnv.forEach(main.checkEnv);

    return q(mainConfig);
};

main.checkEnv = function (envName) {
    if (process.env[envName] == null) {
        logger.log('error', `${envName} environment variable is not set`);
        process.exit(1);
    }
};

main.setupLogging = function (mainConfig) {
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, { level: process.env.LOGGING_LEVEL, timestamp: true });
    return q(mainConfig);
};

main.loadConfig = function (mainConfig) {
    // Load configurations
    dotenv.load();
    // Set the node env variable if not set before
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    return q(mainConfig);
};

main.setupDatabaseConnection = function (mainConfig) {
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

main.setupHTTP = function (mainConfig) {
    const deferred = q.defer();
    const app = express();

    // Express settings
    require('./config/express')(app);

    // Rest routes
    require('./app/routes.js')(app);


    // Start the app by listening on <port>
    const port = process.env.PORT || 3000;
    const server = require('http').createServer(app);

    server.on('listening', () => {
        mainConfig.server = server;
        deferred.resolve(mainConfig);
    });

    server.on('error', (error) => {
        deferred.reject(error);
    });

    server.listen(port);
    logger.info(`Express app started on port ${port}`);
    return deferred.promise;
};

main.applyMigrations = function (mainConfig) {
    const migrationDir = path.join(__dirname, '/app/migrations');

    return migrationService.applyMigrations(migrationDir).then(() => {
        return q(mainConfig);
    });
};

main.start();

