var greyhoundController = module.exports = {};

var expressService = require('../expressService');
var greyhoundService = require('./greyhoundService');
var greyhoundIngestService = require('./greyhoundIngestService');

expressService.addStandardMethods(greyhoundController, greyhoundService);

greyhoundController.searchFields = ['name=name','name~like','sireRef=parentRef||damRef=parentRef', 'createdAt>=startDate', 'createdAt<=endDate'];

greyhoundController.find = function(req, res){
    expressService.standardSearch(req, res, greyhoundService, greyhoundController.searchFields);
};

greyhoundController.create = function(req, res) {
    expressService.promToRes(greyhoundService.createGreyhoundFromJson(req.body), res);
};

greyhoundController.update = function(req, res) {
    expressService.promToRes(greyhoundService.updateGreyhoundFromJson(req.model, req.body), res);
};

greyhoundController.exportCSV = function(req, res){
    var findOptions = expressService.parseSearchParams(req);
    findOptions.query = expressService.buildQueryFromRequest(req, greyhoundController.searchFields);
    findOptions.limit = null;
    expressService.streamCollectionToCSVResponse(res, findOptions, greyhoundService, "greyhound_export", greyhoundService.greyhoundToExportFormat);
};

greyhoundController.exportJSON = function(req, res){
    expressService.streamCollectionToJSONResponse(
        req, res, greyhoundService, greyhoundController.searchFields, "greyhound_export", greyhoundService.greyhoundToExportFormat);
};

greyhoundController.lookup = function(req, res){
    expressService.promToRes(greyhoundIngestService.getExternalGreyhoundInfo(req.model.name), res);
};