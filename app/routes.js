var greyhoundController = require('./greyhound/greyhoundController');
var batchController = require('./batch/batchController');
var batchResultController = require('./batch/batchResultController');
var userController = require('./user/userController');
var raceController = require('./race/raceController');
var placingController = require('./placing/placingController');
var rankingSystemController = require('./ranking/rankingSystemController');
var rankingController = require('./ranking/rankingController');
var adminController = require('./admin/adminController');
var fileController = require('./file/fileController');
var inviteController = require('./invite/inviteController');
var exportController = require('./export/exportController');
var settingController = require('./setting/settingController');
var helper = require('./helper');
var rateLimiter = require('./rateLimiter');
var jwtChecker = require('express-jwt');

var checkAuthentication = jwtChecker({
    secret: new Buffer(process.env.AUTH0_CLIENT_SECRET, 'base64'),
    audience: process.env.AUTH0_CLIENT_ID
});

module.exports = function(app) {
    //user routes
    app.get('/user', checkAuthentication, userController.prepareQuery,  helper.runQuery);
    app.get('/user/:userId', checkAuthentication, helper.getOne);
    app.get('/me', userController.me);
    app.post('/user', checkAuthentication, userController.createActiveUser);
    app.post('/user/requestAccess', rateLimiter.limitedAccess.prevent, userController.requestAccess);
    app.post('/user/grantAccess/:userId', checkAuthentication, userController.grantAccess);
    app.post('/user/resetPassword/:userId', checkAuthentication, userController.resetPassword);
    app.post('/user/changePasswordToken/:userResetToken', rateLimiter.limitedAccess.prevent, userController.changePasswordWithToken);
    app.post('/user/forgotten', rateLimiter.limitedAccess.prevent, userController.forgottenPasswordRequest);

    app.get('/bootstrap', userController.getBootstrap);
    app.post('/user/changePassword', checkAuthentication, userController.changePassword);
    app.put('/user/:userId', checkAuthentication, userController.updateUser);
    app.del('/user/:userId', checkAuthentication, userController.destroy);
    app.param('userId', userController.setModel);

    app.get('/invite', checkAuthentication, inviteController.prepareQuery,  helper.runQuery);
    app.get('/invite/:inviteId', checkAuthentication, helper.getOne);
    app.post('/invite', checkAuthentication, inviteController.createInvite);
    app.del('/invite/expired', checkAuthentication, inviteController.destroyExpired);
    app.del('/invite/:inviteId', checkAuthentication, inviteController.destroy);
    app.param('inviteId', inviteController.setModel);

    //batch routes
    app.get('/batch',checkAuthentication, batchController.prepareBatchQuery, helper.runQuery);
    app.get('/batch/:batchId',checkAuthentication, helper.getOne);
    app.get('/batch/:batchId/totals',checkAuthentication, batchController.totalForBatch);
    app.put('/batch/:batchId',checkAuthentication, helper.mergeBody, batchController.checkFields, helper.save);
    app.del('/batch/:batchId',checkAuthentication, batchController.destroy);
    app.param('batchId',checkAuthentication, batchController.setBatch);

    //batch record routes
    app.get('/batchResult', checkAuthentication, batchResultController.find);
    app.get('/batchResult/:batchResultId',checkAuthentication, batchResultController.getOne);
    app.param('batchResultId',checkAuthentication, batchResultController.setModel);

    //greyhound routes
    app.get('/greyhound', greyhoundController.find);
    app.get('/greyhound.csv', greyhoundController.exportCSV);
    app.get('/greyhound.json', greyhoundController.exportJSON);
    app.get('/greyhound/:greyhoundId', greyhoundController.getOne);
    app.get('/greyhound/:greyhoundId/externalLookUp', checkAuthentication, greyhoundController.lookup);
    app.post('/greyhound', checkAuthentication,greyhoundController.create);
    app.put('/greyhound/:greyhoundId', checkAuthentication, greyhoundController.update);
    app.del('/greyhound/:greyhoundId',checkAuthentication, greyhoundController.destroy);
    app.param('greyhoundId', greyhoundController.setModel);

    //race routes
    app.get('/race', raceController.find);
    app.get('/race.csv', raceController.exportCSV);
    app.get('/race/:raceId', raceController.getOne);
    app.post('/race', checkAuthentication, raceController.create);
    app.put('/race/:raceId', checkAuthentication, raceController.update);
    app.del('/race/:raceId',checkAuthentication, raceController.destroy);
    app.param('raceId', raceController.setModel);

    //distance routes
    app.get('/distance', raceController.getDistinctForDistance);

    //placing routes
    app.get('/placing', placingController.find);
    app.get('/placing/:placingId', placingController.getOne);
    app.post('/placing', checkAuthentication, placingController.create);
    app.put('/placing/:placingId', checkAuthentication, placingController.update);
    app.del('/placing/:placingId',checkAuthentication, placingController.destroy);
    app.param('placingId', placingController.setModel);

    //ranking system
    app.get('/rankingSystem', rankingSystemController.prepareQuery, helper.runQuery);
    app.get('/rankingSystem/:rankingSystemId', helper.getOne);
    app.get('/rankingSystemPreset', rankingSystemController.getPresetFields);
    app.post('/rankingSystem', checkAuthentication, rankingSystemController.create);
    app.put('/rankingSystem/:rankingSystemId', checkAuthentication, rankingSystemController.update);
    app.del('/rankingSystem/:rankingSystemId',checkAuthentication, rankingSystemController.destroy);
    app.param('rankingSystemId', rankingSystemController.setModel);

    //rankings
    app.get('/ranking', rankingController.getRankings);
    app.get('/ranking.csv', rankingController.exportCSV);
    app.get('/ranking.grid.csv', rankingController.exportCSVGrid);
    app.param('rankingId', rankingController.setModel);

    //file routes
    app.get('/file', checkAuthentication, fileController.prepareQuery, helper.runQuery);
    app.get('/file/:fileId', checkAuthentication, helper.getOne);
    app.get('/file/:fileId/download', checkAuthentication, fileController.downloadFile);
    app.del('/file/:fileId', checkAuthentication, fileController.destroy);
    app.post('/file/:uploadType',checkAuthentication, fileController.uploadFile);
    app.param('uploadType',checkAuthentication, fileController.setUploadType);
    app.param('fileId', fileController.setModel);

    app.post('/export/:exportCollection/:exportType',checkAuthentication, exportController.exportCollection);
    app.param('exportCollection', exportController.setExportCollection);
    app.param('exportType', exportController.setExportType);

    //admin
    app.del('/admin/drop/:collectionName', checkAuthentication, adminController.dropCollection);
    app.post('/admin/setup/:collectionName', checkAuthentication, adminController.setupCollection);
    app.get('/admin/count', checkAuthentication, adminController.getCounts);
    app.param('collectionName', adminController.setCollectionName);

    //event
    var eventController = require("./event/eventController");
    app.get('/event', eventController.find);
    app.get('/event/:eventId', eventController.getOne);
    app.param('eventId', eventController.setModel);

    //setting
    app.get('/setting', settingController.find);
    app.get('/setting/:settingId', settingController.getOne);
    app.post('/setting', checkAuthentication, settingController.create);
    app.put('/setting/:settingId', checkAuthentication, settingController.update);
    app.del('/setting/:settingId',checkAuthentication, settingController.destroy);
    app.param('settingId', settingController.setModel);

};
