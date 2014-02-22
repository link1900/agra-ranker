'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var Greyhound = mongoose.model('Greyhound');
var _ = require('lodash');
var greyhoundController = module.exports = {};

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

greyhoundController.addSire = function(req, res, next){
    if (req.greyhound.sireRef){
        Greyhound.findById(req.greyhound.sireRef, function(err, sire) {
            if (err) return next(err);
            if (!sire) return next();
            req.greyhound.sire = sire;
            return next();
        });
    } else {
        next();
    }
};

greyhoundController.addDam = function(req, res, next){
    if (req.greyhound.damRef){
        Greyhound.findById(req.greyhound.damRef, function(err, dam) {
            if (err) return next(err);
            if (!dam) return next();
            req.greyhound.dam = dam;
            return next();
        });
    } else {
        next();
    }
};

greyhoundController.processSire = function(req, res, next){
    if (req.greyhound.sire && req.greyhound.sire.name && !req.greyhound.sireRef){
        if (!req.greyhound.sire._id){
            req.greyhound.sire.name = req.greyhound.sire.name.toLowerCase().trim();
            var search = {'name': req.greyhound.sire.name};
            Greyhound.findOne(search, function(err, sire) {
                if (err) {
                    return res.render(500, 'error checking greyhound name ' + req.greyhound.sire.name);
                } else if (sire) {
                    req.greyhound.sire = sire;
                    req.greyhound.sireRef = req.greyhound.sire._id;
                    next();
                } else { //no sire found create one!
                    var newSire = new Greyhound(req.greyhound.sire);
                    newSire.save(function(err, savedModel) {
                        if (err) {
                            return res.send(err.errors);
                        } else {
                            req.greyhound.sire = savedModel;
                            req.greyhound.sireRef = savedModel._id;
                            next();
                        }
                    });
                }
            });
        } else {
            req.greyhound.sireRef = req.greyhound.sire._id;
            next();
        }
    } else {
        next();
    }
};

/**
 * List of greyhounds
 */
greyhoundController.getMany = function(req, res) {
    var search = {};
    var like = req.param('like');
    var name = req.param('name');
    if (like){
        search = {'name': {'$regex': like.toLowerCase()}};
    }
    if (name){
        search = {'name': name.toLowerCase()};
    }
    Greyhound.find(search, function(err, greyhounds) {
        if (err) {
            res.render('error', {
                status: 500
            });
        } else {
            res.jsonp(greyhounds);
        }
    });
};