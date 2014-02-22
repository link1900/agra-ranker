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
        next();
    });
};

greyhoundController.checkFields = function(req, res, next) {
    if (req.greyhound.name){
        req.greyhound.name = req.greyhound.name.toLowerCase().trim();
    } else {
        return res.send(400, 'greyhound requires name');
    }
    greyhoundController.checkForExists(req, res, next);
};

greyhoundController.checkForExists = function(req, res, next) {
    Greyhound.findOne({"name":req.greyhound.name}, function(err, existingGreyhound) {
        if (err) {
            return res.send(500, 'error checking greyhound name ' + req.greyhound.name);
        }
        if (existingGreyhound && !_.isEqual(existingGreyhound._id, req.greyhound._id)) {
            return res.send(400, 'greyhound already exist with the name ' + existingGreyhound.name);
        }
        next();
    });
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
    var greyhound = req.greyhound;

    greyhound.remove(function(err) {
        if (err) {
            return res.send(err.errors);
        } else {
            res.jsonp(greyhound);
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