var batchResultService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var mongoose = require('mongoose');
var BatchResult = mongoose.model('BatchResult');
var mongoHelper = require('../mongoHelper');

batchResultService.statuses = {
    'failed':'Failed',
    'success':'Success'
};

//batchResultService.createBatchRecord = function(batch, recordNumber, data, callback){
//    var batchRecord = new BatchResult({
//        batchRef:batch._id,
//        type:batch.type,
//        recordNumber: recordNumber,
//        status: constants.batchTypes.awaitingProcessing,
//        rawData: data
//    });
//    batchRecord.save(function(err, savedModel) {
//        if (err) {
//            callback(err, savedModel);
//        } else {
//            callback(null, savedModel);
//        }
//    });
//};