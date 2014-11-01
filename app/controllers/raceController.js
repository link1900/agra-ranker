'use strict';

var raceController = module.exports = {};

var mongoose = require('mongoose');
var Race = mongoose.model('Race');
var GroupLevel = mongoose.model('GroupLevel');
var Placing = mongoose.model('Placing');
var _ = require('lodash');
var helper = require('../helper');
var mongoHelper = require('../mongoHelper');
var q = require('q');


raceController.setRace = function(req, res, next, id) {
    Race.findById(id, function(err, race) {
        if (err) return next(err);
        if (!race) return next(new Error('Failed to load race ' + id));
        req.model = race;
        return next();
    });
};

raceController.prepareQuery = function(req, res, next) {
    req.searchQuery = {};
    var like = req.param('like');
    var name = req.param('name');
    if (like){
        req.searchQuery = {'name': {'$regex': like, '$options' : 'i'}};
    }
    if (name){
        req.searchQuery = {'name': name.toLowerCase()};
    }
    req.dao = Race;
    next();
};

raceController.prepareDistanceQuery = function(req,res,next){
    req.distinctField = 'distanceMeters';
    req.dao = Race;
    next();
};

raceController.create = function(req, res) {
    var entityRequest = {};
    entityRequest.rawEntity = req.body;
    var processChain = raceController.preProcessRaw(entityRequest)
        .then(raceController.makeRace)
        .then(raceController.validate)
        .then(raceController.updateGroupLevelFlyweight)
        .then(helper.saveEntityRequest);

    helper.promiseToResponse(processChain, res);
};

raceController.updateGroupLevelFlyweight = function(entityRequest){
    var deferred = q.defer();
    GroupLevel.findById(entityRequest.newEntity.groupLevelRef, function(err, model) {
        if (err) return deferred.reject("cannot check group level ref");
        if (!model) return deferred.reject("cannot find group level ref");
        entityRequest.newEntity.groupLevel = model;
        deferred.resolve(entityRequest);
    });
    return deferred.promise;
};

raceController.update = function(req, res) {
    var entityRequest = {};
    entityRequest.rawEntity = req.body;
    entityRequest.existingEntity = req.model;
    var processChain = raceController.preProcessRaw(entityRequest)
        .then(helper.mergeEntityRequest)
        .then(raceController.validate)
        .then(raceController.updateGroupLevelFlyweight)
        .then(helper.saveEntityRequest)
        .then(raceController.updateFlyweights);

    helper.promiseToResponse(processChain, res);
};

raceController.updateFlyweights = function(entityRequest){
    return mongoHelper.updateFlyweight(Placing, 'raceRef', 'race', entityRequest.savedEntity).then(function(){
        return entityRequest;
    })
};

raceController.destroy = function(req, res) {
    helper.responseFromPromise(res,
    helper.clearAwayChildren(Placing, 'raceRef', req.model)
    .then(helper.remove));
};

raceController.makeRace = function(entityRequest) {
    entityRequest.newEntity = new Race(entityRequest.newEntity);
    return q(entityRequest);
};

raceController.validate = function(entityRequest){
    var model = entityRequest.newEntity;
    if (!model.name){
        return q.reject("name field is required");
    }

    if (model.name.length == 0){
        return q.reject("name cannot be blank");
    }

    if (!model.date){
        return q.reject("must have a date");
    }

    if (!model.groupLevelRef){
        return q.reject("must have a group level");
    }

    if (!model.distanceMeters){
        return q.reject("must have a distance meters");
    }

    if (model.disqualified == undefined || model.disqualified == null){
        return q.reject("must have a disqualified");
    }

    return raceController.checkGroupRefExists(model.groupLevelRef).then(function(){
        return raceController.checkNameAndDateDoNotExist(model).then(function(){
            return q(entityRequest);
        });
    });
};

raceController.checkNameAndDateDoNotExist = function(model){
    return mongoHelper.find(Race, {name: model.name, date: model.date}).then(function(results){
        if (results.length == 0){
            return q(true);
        } else if (results.length == 1 && _.isEqual(results[0]._id,model._id)) {
            return q(true);
        } else {
            return q.reject("cannot have the same name and date as an existing race");
        }
    });
};

raceController.checkGroupRefExists = function(groupLevelRef){
    var deferred = q.defer();

    GroupLevel.findById(groupLevelRef, function(err, model) {
        if (err) return deferred.reject("cannot check group level ref");
        if (!model) return deferred.reject("cannot find group level ref");
        return deferred.resolve(model);
    });

    return deferred.promise;
};

raceController.preProcessRaw = function(entityRequest){
    var model = entityRequest.rawEntity;

    if (!model){
        return q.reject("must have a body");
    }

    entityRequest.newEntity = model;
    return q(entityRequest);
};
