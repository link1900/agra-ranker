'use strict';

var controller = module.exports = {};

var mongoose = require('mongoose');
var PointScaleValue = mongoose.model('PointScaleValue');
var PointScale = mongoose.model('PointScale');
var _ = require('lodash');
var helper = require('../helper');
var q = require('q');


controller.setModel = function(req, res, next, id) {
    PointScaleValue.findById(id, function(err, model) {
        if (err) return next(err);
        if (!model) return next(new Error('Failed to load ' + id));
        req.model = model;
        return next();
    });
};

controller.prepareQuery = function(req, res, next) {
    req.searchQuery = {};
    var pointScaleRef = req.param('pointScaleRef');

    if (pointScaleRef){
        req.searchQuery = {'pointScaleRef': pointScaleRef};
    }
    req.dao = PointScaleValue;
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
    entityRequest.newEntity = new PointScaleValue(entityRequest.newEntity);
    return q(entityRequest);
};

controller.validate = function(entityRequest){
    var model = entityRequest.newEntity;
    if (!model.placing){
        return q.reject("placing field is required");
    }

    if (model.placing < 1 || model.placing > 30){
        return q.reject("placing must be between 1 and 30");
    }

    if (!model.points){
        return q.reject("points field is required");
    }

    if (model.points < -10000000 || model.points > 10000000){
        return q.reject("points cannot be to large to small");
    }

    if (!model.pointScaleRef){
        return q.reject("pointScaleRef field is required");
    }

    return helper.checkIfRefExists(PointScale, 'pointScaleRef',model).then(function(){
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
