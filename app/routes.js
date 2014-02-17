'use strict';

var greyhoundController = require('./controllers/greyhoundController');

module.exports = function(app) {
    app.get('/greyhound', greyhoundController.getMany);
    app.post('/greyhound',  greyhoundController.create);
    app.get('/greyhound/:greyhoundId', greyhoundController.getOne);
    app.put('/greyhound/:greyhoundId', greyhoundController.update);
    app.del('/greyhound/:greyhoundId', greyhoundController.destroy);

    // Finish with setting up the articleId param
    app.param('greyhoundId', greyhoundController.setGreyhound);

};
