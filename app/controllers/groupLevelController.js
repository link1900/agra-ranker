'use strict';

var groupLevelController = module.exports = {};

var mongoose = require('mongoose');
var GroupLevel = mongoose.model('GroupLevel');
var Race = mongoose.model('Race');
var _ = require('lodash');
var helper = require('../helper');
var q = require('q');


groupLevelController.setModel = function(req, res, next, id) {
    GroupLevel.findById(id, function(err, model) {
        if (err) return next(err);
        if (!model) return next(new Error('Failed to load ' + id));
        req.model = model;
        return next();
    });
};

groupLevelController.prepareQuery = function(req, res, next) {
    req.searchQuery = {};
    var like = req.param('like');
    var name = req.param('name');
    if (like){
        req.searchQuery = {'name': {'$regex': like.toLowerCase()}};
    }
    if (name){
        req.searchQuery = {'name': name.toLowerCase()};
    }
    req.dao = GroupLevel;
    next();
};

groupLevelController.create = function(req, res) {
    var entityRequest = {};
    entityRequest.rawEntity = req.body;
    var processChain = groupLevelController.preProcessRaw(entityRequest)
        .then(groupLevelController.make)
        .then(groupLevelController.validate)
        .then(helper.saveEntityRequest);

    helper.promiseToResponse(processChain, res);
};

groupLevelController.update = function(req, res) {
    var entityRequest = {};
    entityRequest.rawEntity = req.body;
    entityRequest.existingEntity = req.model;
    var processChain = groupLevelController.preProcessRaw(entityRequest)
        .then(helper.mergeEntityRequest)
        .then(groupLevelController.validate)
        .then(helper.saveEntityRequest);

    helper.promiseToResponse(processChain, res);
};

groupLevelController.destroy = function(req, res) {
    helper.responseFromPromise(res,
        helper.cleanFk(Race, 'groupLevelRef', req.model)
        .then(helper.remove)
    );
};

groupLevelController.make = function(entityRequest) {
    entityRequest.newEntity = new GroupLevel(entityRequest.newEntity);
    return q(entityRequest);
};

groupLevelController.validate = function(entityRequest){
    var model = entityRequest.newEntity;
    if (!model.name){
        return q.reject("name field is required");
    }

    if (model.name.length == 0){
        return q.reject("name cannot be blank");
    }

    if (!model.level){
        return q.reject("level field is required");
    }
    return q(entityRequest);
};

groupLevelController.preProcessRaw = function(entityRequest){
    var model = entityRequest.rawEntity;

    if (!model){
        return q.reject("must have a body");
    }

    entityRequest.newEntity = model;
    return q(entityRequest);
};
