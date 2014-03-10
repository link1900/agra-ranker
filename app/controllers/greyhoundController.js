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

/**
 * save a greyhound
 */
greyhoundController.save = function(req, res) {
    req.greyhound.save(function(err, savedModel) {
        if (err) {
            res.send(err.errors);
        } else {
            res.jsonp(savedModel);
        }
    });
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

greyhoundController.getOffspring = function(req, res, next) {
    req.searchQuery =
    {'$or':
        [
            {'sireRef' : req.greyhound._id},
            {'damRef' : req.greyhound._id}
        ]
    };
    req.dao = Greyhound;
    next();
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
    if (like){
        req.searchQuery = {'name': {'$regex': like.toLowerCase()}};
    }
    if (name){
        req.searchQuery = {'name': name.toLowerCase()};
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

    //clean fields
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
