var greyhoundController = require('./greyhound/greyhoundController');
var batchController = require('./batch/batchController');
var batchResultController = require('./batch/batchResultController');
var userController = require('./user/userController');
var securityController = require('./user/securityController');
var raceController = require('./race/raceController');
var groupLevelController = require('./groupLevel/groupLevelController');
var placingController = require('./placing/placingController');
var rankingSystemController = require('./ranking/rankingSystemController');
var rankingController = require('./ranking/rankingController');
var adminController = require('./admin/adminController');
var fileController = require('./file/fileController');
var inviteController = require('./invite/inviteController');
var exportController = require('./export/exportController');
var helper = require('./helper');
var rateLimiter = require('./rateLimiter');

module.exports = function(app) {
    //security routes
    app.post('/login',rateLimiter.limitedAccess.prevent, securityController.login);
    app.post('/logout', securityController.logout);

    //user routes
    app.get('/user', securityController.checkAuthentication, userController.prepareQuery,  helper.runQuery);
    app.get('/user/:userId', securityController.checkAuthentication, helper.getOne);
    app.get('/me', userController.me);
    app.post('/user', securityController.checkAuthentication, userController.createActiveUser);
    app.post('/user/requestAccess', rateLimiter.limitedAccess.prevent, userController.requestAccess);
    app.post('/user/grantAccess/:userId', securityController.checkAuthentication, userController.grantAccess);
    app.post('/user/resetPassword/:userId', securityController.checkAuthentication, userController.resetPassword);
    app.post('/user/changePasswordToken/:userResetToken', rateLimiter.limitedAccess.prevent, userController.changePasswordWithToken);
    app.get('/user/token/:userResetToken', userController.findUserToken);
    app.post('/user/forgotten', rateLimiter.limitedAccess.prevent, userController.forgottenPasswordRequest);

    app.get('/bootstrap', userController.getBootstrap);
    app.post('/user/changePassword', securityController.checkAuthentication, userController.changePassword);
    app.put('/user/:userId', securityController.checkAuthentication, userController.updateUser);
    app.del('/user/:userId', securityController.checkAuthentication, userController.destroy);
    app.param('userId', userController.setModel);

    app.get('/invite', securityController.checkAuthentication, inviteController.prepareQuery,  helper.runQuery);
    app.get('/invite/:inviteId', securityController.checkAuthentication, helper.getOne);
    app.post('/invite', securityController.checkAuthentication, inviteController.createInvite);
    app.del('/invite/expired', securityController.checkAuthentication, inviteController.destroyExpired);
    app.del('/invite/:inviteId', securityController.checkAuthentication, inviteController.destroy);
    app.param('inviteId', inviteController.setModel);

    //batch routes
    app.get('/batch',securityController.checkAuthentication, batchController.prepareBatchQuery, helper.runQuery);
    app.get('/batch/:batchId',securityController.checkAuthentication, helper.getOne);
    app.get('/batch/:batchId/totals',securityController.checkAuthentication, batchController.totalForBatch);
    app.put('/batch/:batchId',securityController.checkAuthentication, helper.mergeBody, batchController.checkFields, helper.save);
    app.del('/batch/:batchId',securityController.checkAuthentication, batchController.destroy);
    app.param('batchId',securityController.checkAuthentication, batchController.setBatch);

    //batch record routes
    app.get('/batchResult', securityController.checkAuthentication, batchResultController.find);
    app.get('/batchResult/:batchResultId',securityController.checkAuthentication, batchResultController.getOne);
    app.param('batchResultId',securityController.checkAuthentication, batchResultController.setModel);

    //greyhound routes
    app.get('/greyhound', greyhoundController.find);
    app.get('/greyhound/:greyhoundId', greyhoundController.getOne);
    app.post('/greyhound', securityController.checkAuthentication,greyhoundController.create);
    app.put('/greyhound/:greyhoundId', securityController.checkAuthentication, greyhoundController.update);
    app.del('/greyhound/:greyhoundId',securityController.checkAuthentication, greyhoundController.destroy);
    app.param('greyhoundId', greyhoundController.setModel);

    // group level routes
    app.get('/groupLevel', groupLevelController.find);
    app.get('/groupLevel/:groupLevelId', groupLevelController.getOne);
    app.post('/groupLevel', securityController.checkAuthentication, groupLevelController.create);
    app.put('/groupLevel/:groupLevelId', securityController.checkAuthentication, groupLevelController.update);
    app.del('/groupLevel/:groupLevelId',securityController.checkAuthentication, groupLevelController.destroy);
    app.param('groupLevelId', groupLevelController.setModel);

    //race routes
    app.get('/race', raceController.find);
    app.get('/race/:raceId', raceController.getOne);
    app.post('/race', securityController.checkAuthentication, raceController.create);
    app.put('/race/:raceId', securityController.checkAuthentication, raceController.update);
    app.del('/race/:raceId',securityController.checkAuthentication, raceController.destroy);
    app.param('raceId', raceController.setModel);

    //distance routes
    app.get('/distance', raceController.getDistinctForDistance);

    //placing routes
    app.get('/placing', placingController.find);
    app.get('/placing/:placingId', placingController.getOne);
    app.post('/placing', securityController.checkAuthentication, placingController.create);
    app.put('/placing/:placingId', securityController.checkAuthentication, placingController.update);
    app.del('/placing/:placingId',securityController.checkAuthentication, placingController.destroy);
    app.param('placingId', placingController.setModel);

    //ranking system
    app.get('/rankingSystem', rankingSystemController.prepareQuery, helper.runQuery);
    app.get('/rankingSystem/:rankingSystemId', helper.getOne);
    app.get('/rankingSystemPreset', rankingSystemController.getPresetFields);
    app.post('/rankingSystem', securityController.checkAuthentication, rankingSystemController.create);
    app.put('/rankingSystem/:rankingSystemId', securityController.checkAuthentication, rankingSystemController.update);
    app.del('/rankingSystem/:rankingSystemId',securityController.checkAuthentication, rankingSystemController.destroy);
    app.param('rankingSystemId', rankingSystemController.setModel);

    //rankings
    app.get('/ranking', rankingController.getRankings);
    app.param('rankingId', rankingController.setModel);

    //file routes
    app.get('/file', securityController.checkAuthentication, fileController.prepareQuery, helper.runQuery);
    app.get('/file/:fileId', securityController.checkAuthentication, helper.getOne);
    app.get('/file/:fileId/download', securityController.checkAuthentication, fileController.downloadFile);
    app.del('/file/:fileId', securityController.checkAuthentication, fileController.destroy);
    app.post('/file/:uploadType',securityController.checkAuthentication, fileController.uploadFile);
    app.param('uploadType',securityController.checkAuthentication, fileController.setUploadType);
    app.param('fileId', fileController.setModel);

    app.post('/export/:exportCollection/:exportType',securityController.checkAuthentication, exportController.exportCollection);
    app.param('exportCollection', exportController.setExportCollection);
    app.param('exportType', exportController.setExportType);

    //admin
    app.del('/admin/drop/:collectionName', securityController.checkAuthentication, adminController.dropCollection);
    app.post('/admin/setup/:collectionName', securityController.checkAuthentication, adminController.setupCollection);
    app.get('/admin/count', securityController.checkAuthentication, adminController.getCounts);
    app.param('collectionName', adminController.setCollectionName);

    //event
    var eventController = require("./event/eventController");
    app.get('/event', eventController.find);
    app.get('/event/:eventId', eventController.getOne);
    app.param('eventId', eventController.setModel);
};
