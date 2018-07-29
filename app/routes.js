const greyhoundController = require('./greyhound/greyhoundController');
const raceController = require('./race/raceController');
const placingController = require('./placing/placingController');
const rankingSystemController = require('./ranking/rankingSystemController');
const rankingController = require('./ranking/rankingController');
const adminController = require('./admin/adminController');
const settingController = require('./setting/settingController');
const eventController = require('./event/eventController');
const helper = require('./helper');
const jwtChecker = require('express-jwt');

const publicKey = new Buffer(process.env.AUTH0_CERT, 'base64');

const checkAuthentication = jwtChecker({
    secret: publicKey
});

module.exports = function (app) {
    // greyhound routes
    app.get('/greyhound', greyhoundController.find);
    app.get('/greyhound.csv', greyhoundController.exportCSV);
    app.get('/greyhound.json', greyhoundController.exportJSON);
    app.get('/greyhound/:greyhoundId', greyhoundController.getOne);
    app.get('/greyhound/:greyhoundId/externalLookUp', checkAuthentication, greyhoundController.lookup);
    app.post('/greyhound', checkAuthentication, greyhoundController.create);
    app.put('/greyhound/:greyhoundId', checkAuthentication, greyhoundController.update);
    app.del('/greyhound/:greyhoundId', checkAuthentication, greyhoundController.destroy);
    app.param('greyhoundId', greyhoundController.setModel);

    // race routes
    app.get('/race', raceController.find);
    app.get('/race.csv', raceController.exportCSV);
    app.get('/race/:raceId', raceController.getOne);
    app.post('/race', checkAuthentication, raceController.create);
    app.put('/race/:raceId', checkAuthentication, raceController.update);
    app.del('/race/:raceId', checkAuthentication, raceController.destroy);
    app.param('raceId', raceController.setModel);

    // distance routes
    app.get('/distance', raceController.getDistinctForDistance);

    // placing routes
    app.get('/placing', placingController.find);
    app.get('/placing/:placingId', placingController.getOne);
    app.post('/placing', checkAuthentication, placingController.create);
    app.put('/placing/:placingId', checkAuthentication, placingController.update);
    app.del('/placing/:placingId', checkAuthentication, placingController.destroy);
    app.param('placingId', placingController.setModel);

    // ranking system
    app.get('/rankingSystem', rankingSystemController.prepareQuery, helper.runQuery);
    app.get('/rankingSystem/:rankingSystemId', helper.getOne);
    app.get('/rankingSystemPreset', rankingSystemController.getPresetFields);
    app.post('/rankingSystem', checkAuthentication, rankingSystemController.create);
    app.put('/rankingSystem/:rankingSystemId', checkAuthentication, rankingSystemController.update);
    app.del('/rankingSystem/:rankingSystemId', checkAuthentication, rankingSystemController.destroy);
    app.param('rankingSystemId', rankingSystemController.setModel);

    // rankings
    app.get('/ranking', rankingController.getRankings);
    app.get('/ranking.csv', rankingController.exportCSV);
    app.get('/ranking.grid.csv', rankingController.exportCSVGrid);
    app.param('rankingId', rankingController.setModel);

    // admin
    app.del('/admin/drop/:collectionName', checkAuthentication, adminController.dropCollection);
    app.post('/admin/setup/:collectionName', checkAuthentication, adminController.setupCollection);
    app.get('/admin/count', checkAuthentication, adminController.getCounts);
    app.param('collectionName', adminController.setCollectionName);

    // event
    app.get('/event', eventController.find);
    app.get('/event/:eventId', eventController.getOne);
    app.param('eventId', eventController.setModel);

    // setting
    app.get('/setting', settingController.find);
    app.get('/setting/:settingId', settingController.getOne);
    app.post('/setting', checkAuthentication, settingController.create);
    app.put('/setting/:settingId', checkAuthentication, settingController.update);
    app.del('/setting/:settingId', checkAuthentication, settingController.destroy);
    app.param('settingId', settingController.setModel);
};
