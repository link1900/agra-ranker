var exportService = module.exports = {};

var moment = require('moment-timezone');
var batchService = require('../batch/batchService');

exportService.createExportJob = function(exportCollectionName, exportType){
    var upperCollectionName = exportService.capitaliseFirstLetter (exportCollectionName);
    var batchType = "export" +  upperCollectionName + exportType.toUpperCase();
    var fileName = exportCollectionName + "_export_" + moment().format('YYYYMMDDHHmmss').toString() + "." + exportType;
    return batchService.createBatch(batchType, {fileName: fileName});
};

exportService.capitaliseFirstLetter = function(string){
    return string.charAt(0).toUpperCase() + string.slice(1);
};