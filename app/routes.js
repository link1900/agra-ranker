'use strict';

var greyhoundController = require('./controllers/greyhoundController');
var batchController = require('./controllers/batchController');
var batchRecordController = require('./controllers/batchRecordController');
var userController = require('./controllers/userController');
var securityController = require('./controllers/securityController');
var helper = require('./helper');

module.exports = function(app) {
    //security routes
    app.post('/login', securityController.login);
    app.post('/logout', securityController.logout);

    //user routes
    app.post('/user', userController.create);
    app.get('/user/me', userController.me);

    //greyhound routes
    app.get('/greyhound', greyhoundController.getMany,  helper.runQuery);
    app.get('/greyhound/:greyhoundId', greyhoundController.getOne);
    app.post('/greyhound', securityController.checkAuthentication,greyhoundController.create);

    app.put('/greyhound/:greyhoundId', securityController.checkAuthentication, greyhoundController.update);

    app.del('/greyhound/:greyhoundId',securityController.checkAuthentication, greyhoundController.destroy);
    app.param('greyhoundId', greyhoundController.setGreyhound);

    //batch routes
    app.get('/batch',securityController.checkAuthentication, batchController.prepareBatchQuery, helper.runQuery);
    app.get('/batch/:batchId',securityController.checkAuthentication, helper.getOne);
    app.put('/batch/:batchId',securityController.checkAuthentication, helper.mergeBody, batchController.checkFields, helper.save);
    app.del('/batch/:batchId',securityController.checkAuthentication, batchController.destroy);
    app.put('/batch/:batchId/run',securityController.checkAuthentication, batchController.processSpecificBatch);
    app.post('/upload/batch',securityController.checkAuthentication, batchController.createBatchFromFile);
    app.param('batchId',securityController.checkAuthentication, batchController.setBatch);

    //batch record routes
    app.get('/batchRecord', securityController.checkAuthentication, batchRecordController.prepareQuery, helper.runQuery);

    //race routes



};
