'use strict';

var raceController = module.exports = {};
var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');

var Race = require('./race').model;
var GroupLevel = require('../groupLevel/groupLevel').model;
var helper = require('../helper');
var raceService = require('./raceService');
var mongoService = require('../mongoService');

var expressService = require('../expressService');
var eventService = require('../event/eventService');

expressService.addStandardMethods(raceController, raceService);

raceController.find = function(req, res){
    expressService.standardSearch(req, res, raceService, ['name=name','name~like']);
};

raceController.getDistinctForDistance = function(req, res){
    return expressService.promToRes(raceService.distinctField('distanceMeters'), res);
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