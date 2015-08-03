var greyhoundController = module.exports = {};

var mongoose = require('mongoose');
var q = require('q');
var _ = require('lodash');
var moment = require('moment');


var expressService = require('../expressService');
var greyhoundService = require('./greyhoundService');

expressService.addStandardMethods(greyhoundController, greyhoundService);

greyhoundController.searchFields = ['name=name','name~like','sireRef=parentRef||damRef=parentRef'];

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
    var fileName = "greyhound_export_" + moment().format('YYYYMMDDHHmmss').toString() + ".csv";
    expressService.streamCollectionToCSVResponse(
        req,
        res,
        greyhoundService,
        greyhoundController.searchFields,
        fileName, greyhoundService.greyhoundExportTransformer);
};