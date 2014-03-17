'use strict';

var greyhoundController = require('./controllers/greyhoundController');
var batchController = require('./controllers/batchController');
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
    app.get('/greyhound/:greyhoundId/offspring', greyhoundController.getOffspring, helper.runQuery);
    app.post('/greyhound',
        securityController.checkAuthentication,
        greyhoundController.createBody,
        greyhoundController.cleanFields,
        greyhoundController.checkFields,
        greyhoundController.checkForExists,
        greyhoundController.checkSireRef,
        greyhoundController.checkDamRef,
        greyhoundController.save);
    app.put('/greyhound/:greyhoundId',
        securityController.checkAuthentication,
        greyhoundController.mergeBody,
        greyhoundController.cleanFields,
        greyhoundController.checkFields,
        greyhoundController.checkForExists,
        greyhoundController.checkSireRef,
        greyhoundController.checkDamRef,
        greyhoundController.save);
    app.del('/greyhound/:greyhoundId',securityController.checkAuthentication, greyhoundController.destroy);
    app.param('greyhoundId', greyhoundController.setGreyhound);

    //batch routes
    app.get('/batch',securityController.checkAuthentication, batchController.prepareBatchQuery, helper.runQuery);
    app.get('/batch/:batchId',securityController.checkAuthentication, helper.getOne);
    app.put('/batch/:batchId',securityController.checkAuthentication, helper.mergeBody, batchController.checkFields, helper.save);
    app.del('/batch/:batchId',securityController.checkAuthentication, batchController.destroy);
    app.get('/batch/:batchId/record',securityController.checkAuthentication, batchController.getRecords, helper.runQuery);
    app.put('/batch/:batchId/run',securityController.checkAuthentication, batchController.processSpecificBatch);
    app.post('/upload/batch',securityController.checkAuthentication, batchController.createBatchFromFile);
    app.param('batchId',securityController.checkAuthentication, batchController.setBatch);

    //race routes



};
