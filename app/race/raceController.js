var raceController = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');

var raceService = require('./raceService');
var mongoService = require('../mongoService');
var expressService = require('../expressService');

expressService.addStandardMethods(raceController, raceService);

raceController.searchFields = ['name=name','name~like', 'date>=startDate', 'date<=endDate'];

raceController.find = function(req, res){
    expressService.standardSearch(req, res, raceService, raceController.searchFields);
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

raceController.exportCSV = function(req, res){
    var findOptions = expressService.parseSearchParams(req);
    findOptions.query = expressService.buildQueryFromRequest(req, raceController.searchFields);
    findOptions.limit = null;
    expressService.streamCollectionToCSVResponse(res, findOptions, raceService, "race_export", raceService.toExportFormat);
};