var exportController = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var mongoService = require('../mongoService');
var helper = require('../helper');
var exportService = require('./exportService');


exportController.exportCollection = function(req, res){
    var promise = exportService.createExportJob(req.exportCollectionName, req.exportType);
    helper.responseFromPromise(res, promise);
};

exportController.setExportType = function(req, res, next, type){
    req.exportType = type;
    next();
};

exportController.setExportCollection = function(req, res, next, type){
    req.exportCollectionName = type;
    next();
};