'use strict';

var raceController = module.exports = {};
var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');

var Race = require('./race').model;
var GroupLevel = require('../groupLevel/groupLevel').model;
var Placing = require('../placing/placing').model;
var helper = require('../helper');
var raceService = require('./raceService');
var mongoService = require('../mongoService');

var expressService = require('../expressService');
var eventService = require('../event/eventService');

raceController.setRace = function(req, res, next, id) {
    Race.findById(id, function(err, race) {
        if (err) return next(err);
        if (!race) return next(new Error('Failed to load race ' + id));
        req.model = race;
        return next();
    });
};

raceController.prepareQuery = function(req, res, next) {
    req.searchQuery = {};
    var like = req.param('like');
    var name = req.param('name');
    if (like){
        req.searchQuery = {'name': {'$regex': like, '$options' : 'i'}};
    }
    if (name){
        req.searchQuery = {'name': name};
    }
    req.dao = Race;
    next();
};

raceController.prepareDistanceQuery = function(req,res,next){
    req.distinctField = 'distanceMeters';
    req.dao = Race;
    next();
};

raceController.create = function(req, res) {
    expressService.promToRes(raceService.createRaceFromJson(req.body), res);
};

raceController.update = function(req, res) {
    expressService.promToRes(raceService.updateRaceFromJson(req.model, req.body), res);
};

raceController.destroy = function(req, res) {
    expressService.promToRes(raceService.remove(req.model), res);
};