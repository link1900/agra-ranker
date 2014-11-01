var batchResultService = module.exports = {};

var BatchResult = mongoose.model('BatchResult');

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