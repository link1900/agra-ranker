var exportService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var moment = require('moment');
var mongoService = require('../mongoService');
var batchService = require('../batch/batchService');
var create = require('../mongoService');

exportService.createExportJob = function(exportCollectionName, exportType){
    var upperCollectionName = exportService.capitaliseFirstLetter (exportCollectionName);
    var batchType = "export" +  upperCollectionName + exportType.toUpperCase();
    var fileName = exportCollectionName + "_export_" + moment().format('YYYYMMDDHHmmss').toString() + "." + exportType;
    return batchService.createBatch(batchType, {fileName: fileName});
};

exportService.capitaliseFirstLetter = function(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
};