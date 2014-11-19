var greyhoundController = require('./greyhound/greyhoundController');
var batchController = require('./batch/batchController');
var batchResultController = require('./batch/batchResultController');
var userController = require('./user/userController');
var securityController = require('./user/securityController');
var raceController = require('./race/raceController');
var groupLevelController = require('./groupLevel/groupLevelController');
var placingController = require('./placing/placingController');
var rankingSystemController = require('./ranking/rankingSystemController');
var pointAllotmentController = require('./ranking/pointAllotmentController');
var rankingController = require('./ranking/rankingController');
var adminController = require('./admin/adminController');
var fileController = require('./file/fileController');
var helper = require('./helper');

module.exports = function(app) {
    //security routes
    app.post('/login', securityController.login);
    app.post('/logout', securityController.logout);

    //user routes
    app.get('/user', securityController.checkAuthentication, userController.prepareQuery,  helper.runQuery);
    app.get('/user/:userId', securityController.checkAuthentication, helper.getOne);
    app.get('/me', userController.me);
    app.post('/user', securityController.checkAuthentication, userController.createActiveUser);
    app.post('/user/requestAccess', userController.requestAccess);
    app.post('/user/grantAccess/:userId', securityController.checkAuthentication, userController.grantAccess);
    //app.post('/user/invite', securityController.checkAuthentication, userController.inviteUser);
    //app.post('/user/acceptInvite', securityController.checkToken, userController.acceptInvite);
    //app.post('/user/becomeAdmin', securityController.checkAuthentication, userController.assumeAdmin);
    app.put('/user/:userId', securityController.checkAuthentication, userController.updateUser);
    app.del('/user/:userId', securityController.checkAuthentication, userController.destroy);
    app.param('userId', userController.setModel);

    //greyhound routes
    app.get('/greyhound', greyhoundController.prepareQuery,  helper.runQuery);
    app.get('/greyhound/:greyhoundId', helper.getOne);
    app.post('/greyhound', securityController.checkAuthentication,greyhoundController.create);
    app.put('/greyhound/:greyhoundId', securityController.checkAuthentication, greyhoundController.update);
    app.del('/greyhound/:greyhoundId',securityController.checkAuthentication, greyhoundController.destroy);
    app.param('greyhoundId', greyhoundController.setGreyhound);

    //batch routes
    app.get('/batch',securityController.checkAuthentication, batchController.prepareBatchQuery, helper.runQuery);
    app.get('/batch/:batchId',securityController.checkAuthentication, helper.getOne);
    app.get('/batch/:batchId/totals',securityController.checkAuthentication, batchController.totalForBatch);
    app.put('/batch/:batchId',securityController.checkAuthentication, helper.mergeBody, batchController.checkFields, helper.save);
    app.del('/batch/:batchId',securityController.checkAuthentication, batchController.destroy);
    app.param('batchId',securityController.checkAuthentication, batchController.setBatch);

    //batch record routes
    app.get('/batchResult', securityController.checkAuthentication, batchResultController.prepareQuery, helper.runQuery);
    app.get('/batchResult/:batchResultId',securityController.checkAuthentication, helper.getOne);
    app.param('batchResultId',securityController.checkAuthentication, batchController.setBatchResult);

    //race routes
    app.get('/race', raceController.prepareQuery, helper.runQuery);
    app.get('/race/:raceId', helper.getOne);
    app.post('/race', securityController.checkAuthentication, raceController.create);
    app.put('/race/:raceId', securityController.checkAuthentication, raceController.update);
    app.del('/race/:raceId',securityController.checkAuthentication, raceController.destroy);
    app.param('raceId', raceController.setRace);

    //distance routes
    app.get('/distance', raceController.prepareDistanceQuery, helper.runDistinctQuery);

    // group level routes
    app.get('/groupLevel', groupLevelController.prepareQuery, helper.runQuery);
    app.get('/groupLevel/:groupLevelId', helper.getOne);
    app.post('/groupLevel', securityController.checkAuthentication, groupLevelController.create);
    app.put('/groupLevel/:groupLevelId', securityController.checkAuthentication, groupLevelController.update);
    app.del('/groupLevel/:groupLevelId',securityController.checkAuthentication, groupLevelController.destroy);
    app.param('groupLevelId', groupLevelController.setModel);

    //placing routes
    app.get('/placing', placingController.prepareQuery, helper.runQuery);
    app.get('/placing/:placingId', helper.getOne);
    app.post('/placing', securityController.checkAuthentication, placingController.create);
    app.put('/placing/:placingId', securityController.checkAuthentication, placingController.update);
    app.del('/placing/:placingId',securityController.checkAuthentication, placingController.destroy);
    app.param('placingId', placingController.setModel);

    //ranking system
    app.get('/rankingSystem', rankingSystemController.prepareQuery, helper.runQuery);
    app.get('/rankingSystem/:rankingSystemId', helper.getOne);
    app.post('/rankingSystem', securityController.checkAuthentication, rankingSystemController.create);
    app.put('/rankingSystem/:rankingSystemId', securityController.checkAuthentication, rankingSystemController.update);
    app.del('/rankingSystem/:rankingSystemId',securityController.checkAuthentication, rankingSystemController.destroy);
    app.param('rankingSystemId', rankingSystemController.setModel);

    //point allotment
    app.get('/pointAllotment', pointAllotmentController.prepareQuery, helper.runQuery);
    app.get('/pointAllotment/:pointAllotmentId', helper.getOne);
    app.post('/pointAllotment', securityController.checkAuthentication, pointAllotmentController.createMany);
    app.param('pointAllotmentId', pointAllotmentController.setModel);

    //rankings
    app.get('/ranking', rankingController.prepareQuery, helper.runQuery);
    app.get('/ranking/:rankingId', helper.getOne);
    app.post('/ranking', securityController.checkAuthentication, rankingController.createRankings);
    app.param('rankingId', rankingController.setModel);

    //file routes
    app.get('/file', securityController.checkAuthentication, fileController.prepareQuery, helper.runQuery);
    app.get('/file/:fileId', securityController.checkAuthentication, helper.getOne);
    app.get('/file/:fileId/download', securityController.checkAuthentication, fileController.downloadFile);
    app.del('/file/:fileId', securityController.checkAuthentication, fileController.destroy);
    app.post('/file/:uploadType',securityController.checkAuthentication, fileController.uploadFile);
    app.param('uploadType',securityController.checkAuthentication, fileController.setUploadType);
    app.param('fileId', fileController.setModel);

    //admin
    app.del('/admin/drop/:collectionName', securityController.checkAuthentication, adminController.dropCollection);
    app.get('/admin/count', securityController.checkAuthentication, adminController.getCounts);
    app.param('collectionName', adminController.setCollectionName);
};
