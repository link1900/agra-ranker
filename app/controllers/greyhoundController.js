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

/**
 * Create a greyhound
 */
greyhoundController.create = function(req, res) {
	var greyhound = new Greyhound(req.body);
	if (greyhound.name){
		greyhound.name = greyhound.name.toLowerCase();
	} else {
		return res.send(400, 'greyhound requires name');
	}
    
	Greyhound.findOne({"name":greyhound.name}, function(err, existingGreyhound) {
        if (err) {
            return res.send(500, 'error finding greyhound');
        }
		console.log(existingGreyhound);
		if (existingGreyhound) {
			return res.send(400, 'greyhound already exist with the name ' + existingGreyhound.name);
        }
		
		greyhound.save(function(err) {
			if (err) {
				return res.send(err.errors);
			} else {
				return res.jsonp(greyhound);
			}
		});
    });
};

/**
 * Find if a greyhound exists by name
 */

/**
 * Update a greyhound
 */
greyhoundController.update = function(req, res) {
    var greyhound = req.greyhound;

    greyhound = _.extend(greyhound, req.body);

    greyhound.save(function(err) {
        if (err) {
            res.send(err.errors);
        } else {
            res.jsonp(greyhound);
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