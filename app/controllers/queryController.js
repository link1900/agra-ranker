'use strict';

var controller = module.exports = {};

var mongoose = require('mongoose');
var Query = mongoose.model('Query');
var PointScale = mongoose.model('PointScale');
var RankingSystem = mongoose.model('RankingSystem');
var QueryParameter = mongoose.model('QueryParameter');
var _ = require('lodash');
var helper = require('../helper');
var q = require('q');


controller.setModel = function(req, res, next, id) {
    Query.findById(id, function(err, model) {
        if (err) return res.jsonp(400, {error: 'Failed to load ' + id});
        if (!model) return res.jsonp(400, {error: 'Failed to load ' + id});
        req.model = model;
        return next();
    });
};

controller.prepareQuery = function(req, res, next) {
    req.searchQuery = {};
    var rankingSystemRef = req.param('rankingSystemRef');

    if (rankingSystemRef){
        req.searchQuery = {'rankingSystemRef': rankingSystemRef};
    }
    req.dao = Query;
    next();
};

controller.create = function(req, res) {
    var entityRequest = {};
    entityRequest.rawEntity = req.body;
    var processChain = controller.preProcessRaw(entityRequest)
        .then(controller.make)
        .then(controller.validate)
        .then(helper.saveEntityRequest);

    helper.promiseToResponse(processChain, res);
};

controller.update = function(req, res) {
    var entityRequest = {};
    entityRequest.rawEntity = req.body;
    entityRequest.existingEntity = req.model;
    var processChain = controller.preProcessRaw(entityRequest)
        .then(helper.mergeEntityRequest)
        .then(controller.validate)
        .then(helper.saveEntityRequest);

    helper.promiseToResponse(processChain, res);
};

controller.destroy = function(req, res) {
    helper.responseFromPromise(res,helper.remove(req.model));
};

controller.make = function(entityRequest) {
    entityRequest.newEntity = new Query(entityRequest.newEntity);
    return q(entityRequest);
};

controller.validate = function(entityRequest){
    var model = entityRequest.newEntity;

    if (!model.rankingSystemRef){
        return q.reject("rankingSystemRef field is required");
    }

    if (!model.pointScaleRef){
        return q.reject("pointScaleRef field is required");
    }

    return helper.checkIfRefExists(RankingSystem, 'rankingSystemRef', model).then(function(){
        return helper.checkIfRefExists(PointScale, 'pointScaleRef', model).then(function(){
            return q(entityRequest);
        });
    });
};

controller.preProcessRaw = function(entityRequest){
    var model = entityRequest.rawEntity;

    if (!model){
        return q.reject("must have a body");
    }

    entityRequest.newEntity = model;
    return q(entityRequest);
};
