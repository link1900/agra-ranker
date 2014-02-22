'use strict';

var greyhoundController = require('./controllers/greyhoundController');

module.exports = function(app) {
    app.get('/greyhound', greyhoundController.getMany);
    app.post('/greyhound',  greyhoundController.createBody, greyhoundController.checkFields, greyhoundController.save);
    app.get('/greyhound/:greyhoundId', greyhoundController.getOne);
    app.put('/greyhound/:greyhoundId', greyhoundController.mergeBody, greyhoundController.checkFields, greyhoundController.save);
    app.del('/greyhound/:greyhoundId', greyhoundController.destroy);

    // Finish with setting up the articleId param
    app.param('greyhoundId', greyhoundController.setGreyhound);

};
