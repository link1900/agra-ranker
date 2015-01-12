var rankingSystemController = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var RankingSystem = require('./rankingSystem').model;
var helper = require('../helper');
var mongoService = require('../mongoService');
var rankingSystemService = require('./rankingSystemService');

rankingSystemController.setModel = function(req, res, next, id) {
    RankingSystem.findById(id, function(err, model) {
        if (err) return next(err);
        if (!model) return next(new Error('Failed to load ' + id));
        req.model = model;
        return next();
    });
};

rankingSystemController.prepareQuery = function(req, res, next) {
    req.searchQuery = {};
    var like = req.param('like');
    var name = req.param('name');
    if (like){
        req.searchQuery = {'name': {'$regex': like.toLowerCase()}};
    }
    if (name){
        req.searchQuery = {'name': name.toLowerCase()};
    }
    req.dao = RankingSystem;
    next();
};

rankingSystemController.create = function(req, res) {
    var entityRequest = {};
    entityRequest.rawEntity = req.body;
    var processChain = rankingSystemService.preProcessRaw(entityRequest)
        .then(rankingSystemController.make)
        .then(rankingSystemService.validate)
        .then(helper.saveEntityRequest);

    helper.promiseToResponse(processChain, res);
};

rankingSystemController.update = function(req, res) {
    var entityRequest = {};
    entityRequest.rawEntity = req.body;
    entityRequest.existingEntity = req.model;
    var processChain = rankingSystemService.preProcessRaw(entityRequest)
        .then(helper.mergeEntityRequest)
        .then(rankingSystemService.validate)
        .then(helper.saveEntityRequest);

    helper.promiseToResponse(processChain, res);
};

rankingSystemController.destroy = function(req, res) {
    helper.responseFromPromise(res,mongoService.removePromise(req.model));
};

rankingSystemController.make = function(entityRequest) {
    entityRequest.newEntity = new RankingSystem(entityRequest.newEntity);
    return q(entityRequest);
};

rankingSystemController.getPresetFields = function(req, res) {
    res.jsonp(_.keys(rankingSystemService.presetCriteriaFields).map(function(key){
        return {
            "label": rankingSystemService.presetCriteriaFields[key].label,
            "value": key
        };
    }));
};