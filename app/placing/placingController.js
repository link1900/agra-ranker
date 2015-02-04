var placingController = module.exports = {};

var _ = require('lodash');
var q = require('q');
var Placing = require('./placing').model;
var placingService = require('./placingService');
var Race = require('../race/race').model;
var Greyhound = require('../greyhound/greyhound').model;
var helper = require('../helper');
var mongoService = require('../mongoService');

placingController.setModel = function(req, res, next, id) {
    Placing.findById(id, function(err, model) {
        if (err) return next(err);
        if (!model) return next(new Error('Failed to load ' + id));
        req.model = model;
        return next();
    });
};

placingController.prepareQuery = function(req, res, next) {
    req.searchQuery = {};
    var raceRef = req.param('raceRef');
    var greyhoundRef = req.param('greyhoundRef');

    if (raceRef){
        req.searchQuery.raceRef = raceRef;
    }
    if (greyhoundRef){
        req.searchQuery.greyhoundRef = greyhoundRef;
    }
    req.dao = Placing;
    next();
};

placingController.create = function(req, res) {
    helper.responseFromPromise(res, placingService.createPlacing(req.body));
};

placingController.update = function(req, res) {
    helper.responseFromPromise(res, placingService.updatePlacing(req.model, req.body));
};

placingController.destroy = function(req, res) {
    helper.responseFromPromise(res, placingService.deletePlacing(req.model));
};