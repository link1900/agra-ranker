const main = module.exports = {};
const q = require('q');
const _ = require('lodash');
const express = require('express');
const path = require('path');
const logger = require('winston');
const serverHelper = require('./app/serverHelper');
const migrationService = require('./app/migration/migrationService');

    /**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

main.start = _.once(() => {
    const mainConfig = {};
    return serverHelper.setupExceptionHandling(mainConfig)
        .then(serverHelper.setupLogging)
        .then(serverHelper.loadConfig)
        .then(serverHelper.checkEnvs)
        .then(serverHelper.setupDatabaseConnection)
        .then(main.applyMigrations)
        .then(main.setupHTTP).then(() => {
            logger.info('Started system successfully');
        }, (err) => {
            logger.log('error', err.message, err.stack);
            process.exit(1);
        });
});

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

