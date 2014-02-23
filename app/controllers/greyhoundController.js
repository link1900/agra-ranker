'use strict';
var greyhoundController = module.exports = {};
/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Greyhound = mongoose.model('Greyhound');
var _ = require('lodash');

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
    req.greyhound = new Greyhound(req.body);
    next();
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
    req.greyhound.remove(function(err, removedModel) {
        if (err) {
            res.send(err.errors);
        } else {
            res.jsonp(removedModel);
        }
    });
};

/**
 * Show an greyhound
 */
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