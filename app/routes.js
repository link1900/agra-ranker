'use strict';

var greyhoundController = require('./controllers/greyhoundController');
var helper = require('./helper');

module.exports = function(app) {
    app.get('/greyhound', greyhoundController.getMany,  helper.runQuery);
    app.get('/greyhound/:greyhoundId', greyhoundController.getOne);
    app.get('/greyhound/:greyhoundId/offspring', greyhoundController.getOffspring, helper.runQuery);
    app.post('/greyhound',
        greyhoundController.createBody,
        greyhoundController.cleanFields,
        greyhoundController.checkFields,
        greyhoundController.checkForExists,
        greyhoundController.checkSireRef,
        greyhoundController.checkDamRef,
        greyhoundController.save);
    app.put('/greyhound/:greyhoundId',
        greyhoundController.mergeBody,
        greyhoundController.cleanFields,
        greyhoundController.checkFields,
        greyhoundController.checkForExists,
        greyhoundController.checkSireRef,
        greyhoundController.checkDamRef,
        greyhoundController.save);
    app.del('/greyhound/:greyhoundId', greyhoundController.destroy);

    // Finish with setting up the articleId param
    app.param('greyhoundId', greyhoundController.setGreyhound);

};
