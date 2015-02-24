var eventController = module.exports = {};

var _ = require('lodash');
var q = require('q');
var Event = require('./event').model;
var eventService = require('./eventService');
var helper = require('../helper');
var mongoService = require('../mongoService');
var expressService = require('../expressService');

expressService.addStandardMethods(eventController, eventService);

eventController.find = function(req, res){
    expressService.standardSearch(req, res, eventService, ["type=type","type~like"]);
};