'use strict';

var rankingSystemController = module.exports = {};

var mongoose = require('mongoose');
var RankingSystem = mongoose.model('RankingSystem');
var _ = require('lodash');
var helper = require('../helper');
var q = require('q');
var mongoHelper = require('../mongoHelper');


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
    var processChain = rankingSystemController.preProcessRaw(entityRequest)
        .then(rankingSystemController.make)
        .then(rankingSystemController.validate)
        .then(helper.saveEntityRequest);

    helper.promiseToResponse(processChain, res);
};

rankingSystemController.update = function(req, res) {
    var entityRequest = {};
    entityRequest.rawEntity = req.body;
    entityRequest.existingEntity = req.model;
    var processChain = rankingSystemController.preProcessRaw(entityRequest)
        .then(helper.mergeEntityRequest)
        .then(rankingSystemController.validate)
        .then(helper.saveEntityRequest);

    helper.promiseToResponse(processChain, res);
};

rankingSystemController.destroy = function(req, res) {
    helper.responseFromPromise(res,helper.remove(req.model));
};

rankingSystemController.checkNameDoesNotExist = function(model){
    return mongoHelper.findAny(RankingSystem, {name: model.name}).then(function(results){
        if (results.length == 0){
            return q(true);
        } else if (results.length == 1 && _.isEqual(results[0]._id,model._id)) {
            return q(true);
        } else {
            return q.reject("cannot have the same name as an existing ranking system");
        }
    });
};

rankingSystemController.make = function(entityRequest) {
    entityRequest.newEntity = new RankingSystem(entityRequest.newEntity);
    return q(entityRequest);
};

rankingSystemController.validate = function(entityRequest){
    var model = entityRequest.newEntity;
    if (!model.name){
        return q.reject("name field is required");
    }

    if (model.name.length == 0){
        return q.reject("name cannot be blank");
    }

    if (!model.description){
        return q.reject("description field is required");
    }

    if (model.equalPositionResolution != null){
        var validResolutions = ["splitPoints","samePoints"];
        if (!_.contains(validResolutions,model.equalPositionResolution)){
            return q.reject("equalPositionResolution must be one of the following: ", validResolutions.join(","));
        }
    }

    return rankingSystemController.checkNameDoesNotExist(model).then(function(){
        return q(entityRequest);
    });
};

rankingSystemController.preProcessRaw = function(entityRequest){
    var model = entityRequest.rawEntity;

    if (!model){
        return q.reject("must have a body");
    }

    entityRequest.newEntity = model;
    return q(entityRequest);
};
