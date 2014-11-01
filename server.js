
var express = require('express');
var fs = require('fs');
var path = require('path');
var passport = require('passport');
var logger = require('mean-logger');

/**
 * Main application entry file.
 * Please note that the order of loading is important.
 */

// Load configurations
// Set the node enviornment variable if not set before
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

// Initializing system variables 
var config = require('./config/config');
var mongoose = require('mongoose');
var grid = require('gridfs-stream');
grid.mongo = mongoose.mongo;

// Bootstrap db connection
var db = mongoose.connect(config.db);

// Bootstrap models
var models_path = __dirname + '/app/models';
var walk = function(path) {
    fs.readdirSync(path).forEach(function(file) {
        var newPath = path + '/' + file;
        var stat = fs.statSync(newPath);
        if (stat.isFile()) {
            if (/(.*)\.(js$|coffee$)/.test(file)) {
                require(newPath);
            }
        } else if (stat.isDirectory()) {
            walk(newPath);
        }
    });
};
walk(models_path);

//apply migrations
var migrationControllerPath = path.join(__dirname, '/app/controllers/migrationController');
var migrationDir = path.join(__dirname, '/app/migrations');
var migrationController = require(migrationControllerPath);
migrationController.applyMigrations(migrationDir).then(function(){
    // Bootstrap passport config
    require('./config/passport')(passport);

    var app = express();

    // Express settings
    require('./config/express')(app, passport, db);

    // Rest routes
    require('./app/routes.js')(app);


    // Start the app by listening on <port>
    var port = process.env.PORT || config.port;
    app.listen(port);
    console.log('Express app started on port ' + port);

    // Initializing logger
    logger.init(app, passport, mongoose);

    // Expose app
    exports = module.exports = app;

    //start scheduler
    var batchService = require('./app/services/batchService');
    batchService.startBatchProcessors();
},function(error){
    console.log(error);
    console.error("critical failure apply migration exiting without server start");
    process.exit(1);
}).fail(function(err){
    console.log("failed to start server");
    console.log(err);
});


