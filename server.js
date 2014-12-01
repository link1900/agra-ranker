var main = module.exports = {};
var q = require('q');
var _ = require('lodash');
var express = require('express');
var fs = require('fs');
var path = require('path');
var passport = require('passport');
var winston = require('winston');
var dotenv = require('dotenv');
var mongoose = require('mongoose');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

main.start = _.once(function(){
    var mainConfig = {};
    return main.setupExceptionHandling(mainConfig)
        .then(main.setupLogging)
        .then(main.loadConfig)
        .then(main.setupDatabaseConnection)
        .then(main.setupSecurity)
        .then(main.setupHTTP)
        .then(main.setupBatchService);
});

main.setupExceptionHandling = function(mainConfig){
    if (process.env.NODE_ENV != 'test'){
        process.on('uncaughtException', function(ex) {
            console.log('Uncaught exception ' + ex);
            process.exit(1);
        });
    }

    return q(mainConfig);
};

main.setupLogging = function(mainConfig){
    winston.remove(winston.transports.Console);
    winston.add(winston.transports.Console, {timestamp: true});
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
    var db = mongoose.connect(process.env.MONGOHQ_URL, function (err) {
        if (err) {
            console.log('Unable to connect at startup, exiting', err);
            deferred.resolve(mainConfig);
        }
    });

    mongoose.connection.on("open", function () {
        console.log("Mongoose: open");
        mainConfig.db = db;
        var grid = require('gridfs-stream');
        grid.mongo = mongoose.mongo;
        deferred.resolve(mainConfig);
    });

    mongoose.connection.on("error", function (err) {
        console.error('Mongoose: ' + err + ' exiting');
    });

    mongoose.connection.on("disconnected", function (err) {
        console.log("Mongoose: disconnected, exiting", err);
    });

    return deferred.promise;
};

main.setupSecurity = function(mainConfig){
    require('./config/passport')();
    return q(mainConfig);
};

main.setupHTTP = function(mainConfig){
    var deferred = q.defer();
    var app = express();

    // Express settings
    require('./config/express')(app, passport, mainConfig.db);

    // Rest routes
    require('./app/routes.js')(app);


    // Start the app by listening on <port>
    var port = process.env.PORT || 3000;
    var server = require('http').createServer(app);

    //var io = require('socket.io')(server);
    //require('./app/sockets.js').setup(io);

    server.on('listening', function(){
        deferred.resolve(mainConfig);
    });

    server.listen(port);
    console.log('Express app started on port ' + port);
    return deferred.promise;
};

main.setupBatchService = function(mainConfig){
    var batchService = require('./app/batch/batchService');
    batchService.startBatchProcessors();
    return q(mainConfig);
};

main.start();


//apply migrations
//var migrationDir = path.join(__dirname, '/app/migrations');
//var migrationService = require('./app/migration/migrationService');
//migrationService.applyMigrations(migrationDir).then(function(){
