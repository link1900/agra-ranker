var exportService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var moment = require('moment');
var mongoService = require('../mongoService');
var batchService = require('../batch/batchService');
var create = require('../mongoService');
var helper = require('../helper');

exportService.createExportJob = function(exportCollectionName, exportType){
    var upperCollectionName = exportService.capitaliseFirstLetter (exportCollectionName);
    var batchType = "export" +  upperCollectionName + exportType.toUpperCase();
    var batchName = exportCollectionName + "_export_" + moment().format('YYMMDDHHmmss').toString() + "." + exportType;
    return batchService.createBatch(batchName, batchType);
};

exportService.capitaliseFirstLetter = function(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
};