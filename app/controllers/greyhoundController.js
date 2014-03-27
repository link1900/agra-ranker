'use strict';
var greyhoundController = module.exports = {};
/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Greyhound = mongoose.model('Greyhound');
var _ = require('lodash');
var helper = require('../helper');
var q = require('q');

/**
 * Find greyhound by id
 */
greyhoundController.setGreyhound = function(req, res, next, id) {
    Greyhound.findById(id, function(err, greyhound) {
        if (err) return next(err);
        if (!greyhound) return next(new Error('Failed to load greyhound ' + id));
        req.greyhound = greyhound;
        return next();
    });
};

greyhoundController.checkFields = function(req, res, next) {
    if (req.greyhound.name){
        return next();
    } else {
        return res.send(400, 'greyhound requires name');
    }
};

greyhoundController.cleanFields = function(req, res, next) {
    if (req.greyhound.name){
        req.greyhound.name = req.greyhound.name.toLowerCase().trim();
    }
    return next();
};

greyhoundController.checkForExists = function(req, res, next) {
    Greyhound.findOne({"name":req.greyhound.name}, function(err, existingGreyhound) {
        if (err) {
            return res.send(500, 'error checking greyhound name ' + req.greyhound.name);
        }
        if (existingGreyhound && !_.isEqual(existingGreyhound._id, req.greyhound._id)) {
            return res.send(400, 'greyhound already exist with the name ' + existingGreyhound.name);
        }
        return next();
    });
};

greyhoundController.checkSireRef = function(req, res, next) {
    if (req.greyhound.sireRef){
        if (_.isEqual(req.greyhound._id, req.greyhound.sireRef)){
            res.send(400, "greyhound cannot be own sire");
            return;
        }

        Greyhound.findById(req.greyhound.sireRef, function(err, existingGreyhound) {
            if (err) {
                return res.send(500, 'error checking sire ref ' + req.greyhound.sireRef);
            }
            if (!existingGreyhound) {
                return res.send(400, 'sire does not exists with id ' + req.greyhound.sireRef);
            }
            return next();
        });
    } else {
        next();
    }
};

greyhoundController.checkDamRef = function(req, res, next) {
    if (req.greyhound.damRef){
        if (_.isEqual(req.greyhound._id, req.greyhound.damRef)){
            res.send(400, "greyhound cannot be own dam");
            return;
        }
        Greyhound.findById(req.greyhound.damRef, function(err, existingGreyhound) {
            if (err) {
                return res.send(500, 'error checking dam ref ' + req.greyhound.damRef);
            }
            if (!existingGreyhound) {
                return res.send(400, 'dam does not exists with id ' + req.greyhound.damRef);
            }
            return next();
        });
    } else {
        next();
    }
};

greyhoundController.mergeBody = function(req, res, next) {
    req.greyhound = _.extend(req.greyhound, req.body);
    next();
};

greyhoundController.createBody = function(req, res, next) {
    req.greyhound = greyhoundController.newGreyhound(req.body);
    next();
};

greyhoundController.newGreyhound = function(json){
    return new Greyhound(json);
};

greyhoundController.preProcessRaw = function(entityRequest){
    var greyhound = entityRequest.rawEntity;

    //no raw field
    if (!greyhound){
        entityRequest.error = "must have a body";
        return q.reject("update must have a body");
    }

    //clean fields
    if (greyhound.name){
        greyhound.name = greyhound.name.toLowerCase().trim();
    }else {
        entityRequest.error = "name field is required";
        return q.reject("name field is required");
    }

    if (greyhound.name.length == 0){
        entityRequest.error = "name cannot be blank";
        return q.reject("name cannot be blank");
    }

//    if (greyhound.sire && greyhound.sire.name){
//        greyhound.sire = {"name":greyhound.sire.name.toLowerCase().trim()};
//    }
//    if (greyhound.dam && greyhound.dam.name){
//        greyhound.dam =  {"name":greyhound.dam.name.toLowerCase().trim()};
//    }

    //check fields

//    if (greyhound.sire && greyhound.sire.name.length == 0){
//        delete greyhound.sire;
//    }
//    if (greyhound.dam && greyhound.dam.name.length == 0){
//        delete greyhound.dam;
//    }
//
//    delete greyhound.sireRef;
//    delete greyhound.damRef;

    entityRequest.newEntity = greyhound;
    return q(entityRequest);
};

greyhoundController.mergeGreyhound = function(updateRequest) {
    var existing = _.clone(updateRequest.existingEntity.toObject());
    updateRequest.newEntity = _.extend(updateRequest.existingEntity, updateRequest.newEntity);
    updateRequest.existingEntity = existing;
    return q(updateRequest);
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
        if (existingGreyhound && !_.isEqual(existingGreyhound._id.toString(), updateRequest.newEntity._id.toString())) {
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
    if (updateRequest.existingEntity.sireRef){
        updateRequest.newEntity.sireRef = updateRequest.existingEntity.sireRef;
    }
    //if sire field is present
    if (updateRequest.newEntity.sire){
        updateRequest.sire.name = updateRequest.newEntity.sire.name.toLowerCase().trim();

        if (updateRequest.newEntity.sire.name.length == 0){
            updateRequest.newEntity.sireRef = undefined;
            delete updateRequest.newEntity.sire;
            deferred.resolve(updateRequest);
        } else {
            greyhoundController.saveOrFindGreyhoundImportObject(updateRequest.newEntity.sire)
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

    if (updateRequest.existingEntity.damRef){
        updateRequest.newEntity.damRef = updateRequest.existingEntity.damRef;
    }

    if (updateRequest.newEntity.dam && updateRequest.newEntity.dam.name){
        updateRequest.newEntity.dam.name = updateRequest.newEntity.dam.name.toLowerCase().trim();

        if (updateRequest.newEntity.dam.name.length == 0){
            updateRequest.newEntity.damRef = undefined;
            delete updateRequest.newEntity.dam;
            deferred.resolve(updateRequest);
        } else {
            greyhoundController.saveOrFindGreyhoundImportObject(updateRequest.newEntity.dam)
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

greyhoundController.create = function(req, res) {
    var entityRequest = {};
    entityRequest.rawEntity = req.body;
    var processChain = greyhoundController.preProcessRaw(entityRequest)
        .then(greyhoundController.makeGreyhound)
        .then(greyhoundController.checkForExistsPromise)
        .then(greyhoundController.processSireField)
        .then(greyhoundController.processDamField)
        .then(helper.saveEntityRequest);

    helper.promiseToResponse(processChain, res);

};

greyhoundController.update = function(req, res) {
    var updateRequest = {};
    updateRequest.rawEntity = req.body;
    updateRequest.existingEntity = req.greyhound;
    var processChain = greyhoundController.preProcessRaw(updateRequest)
    .then(greyhoundController.mergeGreyhound)
    .then(greyhoundController.checkForExistsPromise)
    .then(greyhoundController.processSireField)
    .then(greyhoundController.processDamField)
    .then(helper.saveEntityRequest);

    helper.promiseToResponse(processChain, res);

};

/**
 * Delete an greyhound
 */
greyhoundController.destroy = function(req, res) {
    //clean up references
    helper.cleanFk(Greyhound, 'sireRef', req.greyhound._id, res);
    helper.cleanFk(Greyhound, 'damRef', req.greyhound._id, res);

    req.greyhound.remove(function(err, removedModel) {
        if (err) {
            res.send(err.errors);
        } else {
            res.jsonp(removedModel);
        }
    });
};

greyhoundController.getOne = function(req, res) {
    res.jsonp(req.greyhound);
};

/**
 * List of greyhounds
 */
greyhoundController.getMany = function(req, res, next) {
    req.searchQuery = {};
    var like = req.param('like');
    var name = req.param('name');
    var parentRef = req.param('parentRef');
    if (like){
        req.searchQuery = {'name': {'$regex': like.toLowerCase()}};
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

greyhoundController.rawCsvArrayToGreyhound = function(rawRow){
    var greyhound = {
        name : rawRow[0],
        sire: {name: rawRow[1]},
        dam: {name:rawRow[2]}
    };

    if (greyhound.name){
        greyhound.name = greyhound.name.toLowerCase().trim();
    }
    if (greyhound.sire.name){
        greyhound.sire.name = greyhound.sire.name.toLowerCase().trim();
    }
    if (greyhound.dam.name){
        greyhound.dam.name = greyhound.dam.name.toLowerCase().trim();
    }

    //check fields
    if (greyhound.name.length == 0){
        return null;
    }
    if (greyhound.sire.name.length == 0){
        delete greyhound.sire;
    }
    if (greyhound.dam.name.length == 0){
        delete greyhound.dam;
    }
    return greyhound;
};

greyhoundController.processGreyhoundImportObject = function(greyhound){
    var parentPromises = [];
    if (greyhound.sire){
        parentPromises.push(greyhoundController.saveOrFindGreyhoundImportObject(greyhound.sire));
    }
    if (greyhound.dam){
        parentPromises.push(greyhoundController.saveOrFindGreyhoundImportObject (greyhound.dam));
    }

    return q.all(parentPromises).then(function(parentResults){
        if (parentResults.length > 0){
            greyhound.sireRef = parentResults[0]._id;
        }

        if (parentResults.length > 1){
            greyhound.damRef = parentResults[1]._id;
        }

        return greyhoundController.saveOrFindGreyhoundImportObject(greyhound);
    });
};

greyhoundController.saveOrFindGreyhoundImportObject = function(greyhound){
    greyhound = greyhoundController.newGreyhound(greyhound);
    return greyhoundController.findExisting(greyhound).then(helper.savePromise);
};

greyhoundController.findExisting = function(greyhound) {
    var deferred = q.defer();
    Greyhound.findOne({"name":greyhound.name}, function(err, existingGreyhound) {
        if (err) {
            deferred.reject('error checking greyhound name ' + greyhound.name);
        }
        if (existingGreyhound) {
            deferred.resolve(existingGreyhound);
        }
        deferred.resolve(greyhound);

    });
    return deferred.promise;
};

greyhoundController.saveGreyhoundImportObject = function(greyhound){
    greyhound = greyhoundController.newGreyhound(greyhound);
    return greyhoundController.checkForExistsImport(greyhound).then(helper.savePromise);
};

greyhoundController.checkForExistsImport = function(greyhound) {
    var deferred = q.defer();
    Greyhound.findOne({"name":greyhound.name}, function(err, existingGreyhound) {
        if (err) {
            deferred.reject('error checking greyhound name ' + greyhound.name);
        }
        if (existingGreyhound) {
            deferred.reject('greyhound already exist with the name ' + existingGreyhound.name);
        }
        deferred.resolve(greyhound);

    });
    return deferred.promise;
};
