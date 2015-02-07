var greyhoundController = module.exports = {};

var mongoose = require('mongoose');
var Greyhound = require('./greyhound').model;
var Placing = require('../placing/placing').model;
var _ = require('lodash');
var helper = require('../helper');
var mongoService = require('../mongoService');
var expressService = require('../expressService');
var greyhoundService = require('./greyhoundService');
var q = require('q');

expressService.addStandardMethods(greyhoundController, greyhoundService);

greyhoundController.prepareQuery = function(req, res, next) {
    req.searchQuery = {};
    var like = req.param('like');
    var name = req.param('name');
    var parentRef = req.param('parentRef');
    if (like){
        req.searchQuery = {'name': {'$regex': "^"+like.toLowerCase()}};
    }
    if (name){
        req.searchQuery = {'name': name.toLowerCase()};
    }
    if (parentRef){
        req.searchQuery =
        {'$or':
            [
                {'sireRef' : parentRef},
                {'damRef' : parentRef}
            ]
        };
    }
    req.dao = Greyhound;
    next();
};

greyhoundController.create = function(req, res) {
    var entityRequest = {};
    entityRequest.rawEntity = req.body;
    var processChain = greyhoundController.preProcessRaw(entityRequest)
        .then(greyhoundController.checkForExistsPromise)
        .then(greyhoundController.processSireField)
        .then(greyhoundController.processDamField)
        .then(greyhoundController.makeGreyhound)
        .then(helper.saveEntityRequest);

    helper.promiseToResponse(processChain, res);

};

greyhoundController.update = function(req, res) {
    var updateRequest = {};
    updateRequest.rawEntity = req.body;
    updateRequest.existingEntity = req.model;
    var processChain = greyhoundController.preProcessRaw(updateRequest)
        .then(greyhoundController.checkForExistsPromise)
        .then(greyhoundController.processSireField)
        .then(greyhoundController.processDamField)
        .then(helper.mergeEntityRequest)
        .then(helper.saveEntityRequest)
        .then(greyhoundController.updateFlyweights);

    helper.promiseToResponse(processChain, res);

};

greyhoundController.updateFlyweights = function(entityRequest){
    return mongoService.updateFlyweight(Placing, 'greyhoundRef', 'greyhound', entityRequest.savedEntity).then(function(){
        return entityRequest;
    });
};

greyhoundController.preProcessRaw = function(entityRequest){
    var greyhound = entityRequest.rawEntity;

    //no raw field
    if (!greyhound){
        return q.reject("must have a body");
    }

    //clean fields
    if (greyhound.name){
        greyhound.name = greyhound.name.toLowerCase().trim();
    }else {
        return q.reject("name field is required");
    }

    if (greyhound.name.length == 0){
        return q.reject("name cannot be blank");
    }

    if(greyhound.sireRef){
        delete greyhound.sireRef;
    }

    if(greyhound.damRef){
        delete greyhound.damRef;
    }

    if (greyhound.sire && greyhound.sire.name) {
        greyhound.sire.name = greyhound.sire.name.toLowerCase().trim();
        if (_.isEqual(greyhound.sire.name, greyhound.name)){
            return q.reject("cannot set sire name to greyhound name");
        }
    }

    if (greyhound.dam && greyhound.dam.name) {
        greyhound.dam.name = greyhound.dam.name.toLowerCase().trim();
        if (_.isEqual(greyhound.dam.name, greyhound.name)){
            return q.reject("cannot set dam name to greyhound name");
        }
    }

    if (greyhound.dam && greyhound.dam.name && greyhound.sire && greyhound.sire.name) {
        if (_.isEqual(greyhound.dam.name, greyhound.sire.name)){
            return q.reject("cannot have the same sire and dam name");
        }
    }

    entityRequest.newEntity = greyhound;
    return q(entityRequest);
};

greyhoundController.makeGreyhound = function(entityRequest) {
    entityRequest.newEntity = new Greyhound(entityRequest.newEntity);
    return q(entityRequest);
};

greyhoundController.checkForExistsPromise = function(updateRequest) {
    var deferred = q.defer();
    Greyhound.findOne({"name":updateRequest.newEntity.name}, function(err, existingGreyhound) {
        if (err) {
            deferred.reject('error checking greyhound name ' + updateRequest.newEntity.name);
        }
        if (existingGreyhound && !(updateRequest.newEntity._id && _.isEqual(existingGreyhound._id.toString(), updateRequest.newEntity._id.toString()))) {
            deferred.reject('greyhound already exist with the name ' + existingGreyhound.name);
        } else {
            deferred.resolve(updateRequest);
        }
    });
    return deferred.promise;
};

greyhoundController.processSireField = function(updateRequest) {
    var deferred = q.defer();

    //ignore incoming changes to sireRef if it already has one
    if (updateRequest.existingEntity && updateRequest.existingEntity.sireRef){
        updateRequest.newEntity.sireRef = updateRequest.existingEntity.sireRef;
    }

    if (updateRequest.newEntity && updateRequest.newEntity.sire){
        if (updateRequest.newEntity.sire.name != undefined){
            updateRequest.newEntity.sire.name = updateRequest.newEntity.sire.name.toLowerCase().trim();
        } else {
            updateRequest.newEntity.sire.name = "";
        }


        if (updateRequest.existingEntity && _.isEqual(updateRequest.newEntity.sire.name, updateRequest.existingEntity.name)){
            deferred.reject("cannot be own sire");
        }

        if (updateRequest.newEntity.sire.name.length == 0){
            updateRequest.newEntity.sireRef = null;
            delete updateRequest.newEntity.sire;
            deferred.resolve(updateRequest);
        } else {
            greyhoundService.saveOrFindGreyhoundImportObject(updateRequest.newEntity.sire)
            .then(function(createResult){
                updateRequest.newEntity.sireRef = createResult._id;
                deferred.resolve(updateRequest);
            })
            .fail(function(failure){
                deferred.reject('failed to save sire: ' + failure);
            });
        }
    } else {
        deferred.resolve(updateRequest);
    }
    return deferred.promise;
};

greyhoundController.processDamField = function(updateRequest) {
    var deferred = q.defer();

    if (updateRequest.existingEntity && updateRequest.existingEntity.damRef){
        updateRequest.newEntity.damRef = updateRequest.existingEntity.damRef;
    }

    if (updateRequest.newEntity && updateRequest.newEntity.dam){
        if (updateRequest.newEntity.dam.name != undefined){
            updateRequest.newEntity.dam.name = updateRequest.newEntity.dam.name.toLowerCase().trim();
        } else {
            updateRequest.newEntity.dam.name = "";
        }

        if (updateRequest.existingEntity && _.isEqual(updateRequest.newEntity.dam.name,  updateRequest.existingEntity.name)){
            deferred.reject("cannot be own dam");
        }

        if (updateRequest.newEntity.dam.name.length == 0){
            updateRequest.newEntity.damRef = null;
            delete updateRequest.newEntity.dam;
            deferred.resolve(updateRequest);
        } else {
            greyhoundService.saveOrFindGreyhoundImportObject(updateRequest.newEntity.dam)
            .then(function(createResult){
                updateRequest.newEntity.damRef = createResult._id;
                deferred.resolve(updateRequest);
            })
            .fail(function(failure){
                updateRequest.error = failure;
                deferred.reject('failed to save dam: ' + failure);
            });
        }
    } else {
        deferred.resolve(updateRequest);
    }
    return deferred.promise;
};

greyhoundController.destroy = function(req, res) {
    helper.responseFromPromise(res, greyhoundService.deleteGreyhound(req.model));
};

