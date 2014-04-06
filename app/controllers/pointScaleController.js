'use strict';

var controller = module.exports = {};

var mongoose = require('mongoose');
var PointScale = mongoose.model('PointScale');
var PointScaleValue = mongoose.model('PointScaleValue');
var _ = require('lodash');
var helper = require('../helper');
var q = require('q');


controller.setModel = function(req, res, next, id) {
    PointScale.findById(id, function(err, model) {
        if (err) return next(err);
        if (!model) return next(new Error('Failed to load ' + id));
        req.model = model;
        return next();
    });
};

controller.prepareQuery = function(req, res, next) {
    req.searchQuery = {};
    var like = req.param('like');
    var name = req.param('name');
    if (like){
        req.searchQuery = {'name': {'$regex': like.toLowerCase()}};
    }
    if (name){
        req.searchQuery = {'name': name.toLowerCase()};
    }
    req.dao = PointScale;
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
    helper.responseFromPromise(res,
        helper.clearAwayChildren(PointScaleValue, 'pointScaleRef', req.model)
            .then(helper.remove));
};

controller.make = function(entityRequest) {
    entityRequest.newEntity = new PointScale(entityRequest.newEntity);
    return q(entityRequest);
};

controller.validate = function(entityRequest){
    var model = entityRequest.newEntity;
    if (!model.name){
        return q.reject("name field is required");
    }

    if (model.name.length == 0){
        return q.reject("name cannot be blank");
    }

    return q(entityRequest);
};

controller.preProcessRaw = function(entityRequest){
    var model = entityRequest.rawEntity;

    if (!model){
        return q.reject("must have a body");
    }

    entityRequest.newEntity = model;
    return q(entityRequest);
};
