var main = module.exports = {};
var q = require('q');
var _ = require('lodash');
var express = require('express');
var path = require('path');
var winston = require('winston');
var logger = require('winston');
var dotenv = require('dotenv');
var mongoose = require('mongoose');

var migrationService = require('./migration/migrationService');

    /**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

main.start = _.once(function(){
    var mainConfig = {};
    return main.setupExceptionHandling(mainConfig)
        .then(main.setupLogging)
        .then(main.loadConfig)
        .then(main.checkEnvs)
        .then(main.setupDatabaseConnection)
        .then(main.applyMigrations)
        .then(main.setupHTTP)
        .then(main.setupBatchService).then(function(){
            logger.info("Started system successfully");
        }, function(err){
            logger.log('error', err.message, err.stack);
            process.exit(1);
        });
});

main.setupExceptionHandling = function(mainConfig){
    process.on('uncaughtException', function(ex) {
        logger.error('Uncaught exception ' + ex);
        process.exit(1);
    });

    return q(mainConfig);
};

main.checkEnvs = function(mainConfig){
    var requiredEnv = [
        'MONGO_URL',
        'SESSION_SECRET',
        'FIRST_USER_PASSCODE'];

    if (!process.env.LOGGING_LEVEL){
        process.env.LOGGING_LEVEL = 'warn';
    }

    requiredEnv.forEach(main.checkEnv);

    return q(mainConfig);
};

main.checkEnv = function(envName){
    if (process.env[envName] == null){
        logger.log('error',envName + ' environment variable is not set');
        process.exit(1);
    }
};

main.setupLogging = function(mainConfig){
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, { level: process.env.LOGGING_LEVEL,timestamp: true});
    return q(mainConfig);
};

main.loadConfig = function(mainConfig){
    // Load configurations
    dotenv.load();
    // Set the node enviornment variable if not set before
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    return q(mainConfig);
};

main.setupDatabaseConnection = function(mainConfig){
    var deferred = q.defer();
    var db = mongoose.connect(process.env.MONGO_URL, function (err) {
        if (err) {
            logger.error('Unable to connect at startup, exiting', err);
            deferred.resolve(mainConfig);
        }
    });

    mongoose.connection.on("open", function () {
        logger.info("Mongoose: open");
        mainConfig.db = db;
        var grid = require('gridfs-stream');
        grid.mongo = mongoose.mongo;
        deferred.resolve(mainConfig);
    });

    mongoose.connection.on("error", function (err) {
        logger.error('Mongoose: ' + err + ' exiting');
    });

    mongoose.connection.on("disconnected", function (err) {
        logger.log("Mongoose: disconnected, exiting", err);
    });

    return deferred.promise;
};

main.setupHTTP = function(mainConfig){
    var deferred = q.defer();
    var app = express();

    // Express settings
    require('./config/express')(app);

    // Rest routes
    require('./routes.js')(app);


    // Start the app by listening on <port>
    var port = process.env.PORT || 3000;
    var server = require('http').createServer(app);

    server.on('listening', function(){
        mainConfig.server = server;
        deferred.resolve(mainConfig);
    });

    server.on('error', function(error){
        deferred.reject(error);
    });

    server.listen(port);
    logger.info('Express app started on port ' + port);
    return deferred.promise;
};

main.setupBatchService = function(mainConfig){
    var batchService = require('./batch/batchService');
    batchService.startBatchProcessors();
    return q(mainConfig);
};

main.applyMigrations = function(mainConfig){
    var migrationDir = path.join(__dirname, '/migrations');

    return migrationService.applyMigrations(migrationDir).then(function(){
        return q(mainConfig);
    });
};

main.start();



