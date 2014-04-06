'use strict';

var controller = module.exports = {};

var mongoose = require('mongoose');
var Query = mongoose.model('Query');
var QueryParameter = mongoose.model('QueryParameter');
var _ = require('lodash');
var helper = require('../helper');
var q = require('q');


controller.setModel = function(req, res, next, id) {
    QueryParameter.findById(id, function(err, model) {
        if (err) return res.jsonp(400, {error: 'Failed to load ' + id});
        if (!model) return res.jsonp(400, {error: 'Failed to load ' + id});
        req.model = model;
        return next();
    });
};

controller.prepareQuery = function(req, res, next) {
    req.searchQuery = {};
    var queryRef = req.param('queryRef');

    if (queryRef){
        req.searchQuery = {'queryRef': queryRef};
    }
    req.dao = QueryParameter;
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
    entityRequest.newEntity = new QueryParameter(entityRequest.newEntity);
    return q(entityRequest);
};

controller.validate = function(entityRequest){
    var model = entityRequest.newEntity;

    if (!model.queryRef){
        return q.reject("queryRef field is required");
    }

    if (!model.field){
        return q.reject("field field is required");
    }

    if (!model.comparator){
        return q.reject("comparator field is required");
    }

    var compares = ["=",">","<"];
    var found = _.find(compares, function(item){
        return _.isEqual(item, model.comparator);
    });

    if (!found){
        return q.reject("comparator must be of the following values: = > or <");
    }

    if (!model.value){
        return q.reject("value field is required");
    }

    return helper.checkIfRefExists(Query, 'queryRef', model).then(function(){
        return q(entityRequest);
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
