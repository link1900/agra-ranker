var batchService = module.exports = {};

var _ = require('lodash');
var q = require('q');
var logger = require('winston');
var uuid = require('node-uuid');
var csv = require('csv');
var mongoose = require('mongoose');
var BatchJob = require('./batchJob').model;
var BatchResult = require('./batchResult').model;
var mongoService = require('../mongoService');
var fileService = require('../file/fileService');

batchService.states = {
    standby : 'Sleeping',
    processing : 'Processing',
    searching: 'Searching...',
    inactive : 'Disabled'
};

batchService.batchHandlers = {};

batchService.processes = [
    {
        id: uuid.v4(),
        name: "Batch processor",
        state : batchService.states.standby
    }
];

batchService.batchStatuses = {
    awaitingProcessing: 'Awaiting processing',
    failed:'Failed',
    cancelled:'Cancelled',
    inProgress:'In progress',
    completed:'Completed',
    completedWithFailures:'Completed with failures'
};

batchService.startBatchProcessors = function(){
    batchService.processes.forEach(function(process){
        logger.log("info","["+process.name+"]" + " has been started");
        setInterval(batchService.processorTick, 5000, process);
    });

    logger.log("info","[failed batch job checker]" + " has been started");
    setInterval(batchService.failedBatchJobChecker, 10000);
};

batchService.loadBatchHandler = function(key, handler){
    batchService.batchHandlers[key] = handler;
};

/**
 * Finds all in progress batch jobs and check they are being processed by a processor.
 * If no processor claims the batch job mark it as failed.
 */
batchService.failedCheckerState = batchService.states.standby;

batchService.failedBatchJobChecker = function(){
    if (batchService.failedCheckerState == batchService.states.standby){
        batchService.failedCheckerState = batchService.states.processing;
        logger.log('debug',"[failed batch job checker] started looking for stuck batch jobs");
        mongoService.find(BatchJob, {status: batchService.batchStatuses.inProgress}).then(function(batchesInProgress){
            var proms = batchesInProgress.map(function(batchInProgress){
                if(!batchService.doesAnyProcessContainBatch(batchInProgress)){
                    //batch in progress that is not in a processor. mark it as failed
                    batchInProgress.status = batchService.batchStatuses.failed;
                    return mongoService.savePromise(batchInProgress).then(function(result){
                        logger.log("info","[failed batch job checker] has marked batch job " +
                            " id: " + batchInProgress._id +
                            " name: " + batchInProgress.type +
                            " as Failed because nothing is processing it");
                        return result;
                    }, function(updateFailure){
                        batchService.failedCheckerState = batchService.states.standby;
                        logger.log("info","[failed batch job checker] had an error trying to update a batch job to failed", updateFailure);
                    });
                } else {
                    return q(true);
                }
            });
            q.all(proms).then(function(){
                batchService.failedCheckerState = batchService.states.standby;
                logger.log('debug',"[failed batch job checker] finished looking for stuck batch jobs");
            }, function(someError){
                logger.log("info","[failed batch job checker] has had an error", someError);
                batchService.failedCheckerState = batchService.states.standby;
            });
        }, function(err){
            logger.log("info","[failed batch job checker] has had an error", err);
            batchService.failedCheckerState = batchService.states.standby;
        });
    } else {
        logger.log("info","[failed batch job checker] is busy did not fire at this time");
    }
};

batchService.doesAnyProcessContainBatch = function(batch){
    return _.any(batchService.processes, function(process){
         return batchService.doesProcessContainBatch(process, batch);
     });
};

batchService.doesProcessContainBatch = function(process, batch){
    return process.state == batchService.states.processing &&
        process.processingBatch != null &&
        _.isEqual(process.processingBatch._id, batch._id);
};

batchService.processorTick = function(processor){
    if (processor.state == batchService.states.standby){
        batchService.executeProcessor(processor);
    } else {
        logger.log("info",processor.name + " is busy");
    }
};

batchService.executeProcessor = function(processor){
    processor.state = batchService.states.searching;
    //find a batch that requires processing
    var query = {status: batchService.batchStatuses.awaitingProcessing};
    var update = {status: batchService.batchStatuses.inProgress};
    var options = {sort : {createdAt : 1}};
    BatchJob.findOneAndUpdate(query, update, options, function(err, batchToProcess) {
        if (err) {
            logger.log("info",processor.name + " had an error reading batch", err);
            batchService.clearProcessor(processor);
        } else if (batchToProcess != null) {
            logger.log("info",processor.name + " started processing batch job " + batchToProcess.type);
            processor.state = batchService.states.processing;
            processor.processingBatch = batchToProcess;
            batchService.processBatch(processor.processingBatch).then(function(){
                logger.log('info',processor.name + " finished processing batch job " + batchToProcess.type);
                batchToProcess.status = batchService.batchStatuses.completed;
                mongoService.savePromise(batchToProcess).then(function(){
                    batchService.clearProcessor(processor);
                }, function(){
                    logger.log('info',processor.name + " had an error updating batch", err);
                    batchService.clearProcessor(processor);
                });
            }, function(batchProcessError){
                logger.log("info", processor.name + " had an error processing batch job:" + batchProcessError);
                batchToProcess.status = batchService.batchStatuses.failed;
                mongoService.savePromise(batchToProcess).then(function(){
                    batchService.clearProcessor(processor);
                }, function(){
                    logger.log("info", processor.name + " had an error updating batch", err);
                    batchService.clearProcessor(processor);
                });
            });
        } else {
            logger.log('debug',processor.name + " found no batch jobs to process");
            batchService.clearProcessor(processor);
        }
    });
};

batchService.clearProcessor = function(processor){
    delete processor.processingBatch;
    processor.state = batchService.states.standby;
};

batchService.processBatch = function(batchJob){
    if (_.contains(_.keys(batchService.batchHandlers), batchJob.type)){
        return batchService.batchHandlers[batchJob.type](batchJob);
    } else {
        return q.reject("unknown batch of type: " + batchJob.type);
    }
};

batchService.batchJobResultOptions = {
    'failed':'Failed',
    'success':'Success'
};

batchService.getBatchResultFromBoolean = function(boolean){
    if (boolean){
        return batchService.batchJobResultOptions.success;
    } else {
        return batchService.batchJobResultOptions.failed;
    }
};

batchService.getBatchInfo = function(){
    return batchService.processes[0];
};

batchService.createBatch = function(type, metadata, createIfNotAwaiting) {
    //generate the batch model
    var batch = new BatchJob({
        type:type,
        metadata: metadata,
        status: batchService.batchStatuses.awaitingProcessing
    });
    //then check the fields
    var error = batchService.hasError(batch);
    if (error){
        return q.reject(error);
    } else {
        if (createIfNotAwaiting === true){
            return mongoService.findOne(BatchJob, {type:type, status: batchService.batchStatuses.awaitingProcessing}).then(function(result){
                if (result != null){
                    return result;
                } else {
                    return mongoService.savePromise(batch);
                }
            });
        } else {
            return mongoService.savePromise(batch);
        }
    }
};

batchService.updateBatchJob = function(batchJob){
    return mongoService.savePromise(batchJob);
};

batchService.hasError = function(batch){
    var error;
    var typeValid = batch.type && batch.type.length > 0;
    if (!typeValid){
        if (!error){
            error = {errors:[]};
        }
        error.message = 'invalid field';
        error.errors.push('type is required');
    }

    if (error){
        return error;
    } else {
        return null;
    }
};

batchService.createBatchHandler = function(req, file){
    return batchService.createBatch(req.param('batchType'), {fileName: req.headers.uploadfilename, fileId : file._id}).then(function(batch){
        return q(batch);
    }, function(batchCreationError){
        logger.log("error","batch creation error");
        return q.reject({'error':batchCreationError});
    });
};

batchService.createBatchResult = function(batchRef, recordNumber, status, startDate, raw, stepResults){
    var batchResult = new BatchResult({
        batchRef: batchRef,
        recordNumber: recordNumber,
        status: status,
        startDate: startDate,
        endDate: new Date(),
        raw: raw,
        stepResults: stepResults
    });
    return mongoService.savePromise(batchResult)
};

batchService.processBatchJobFile = function(batchJob, rowProcessor){
    var deferred = q.defer();
    if (batchJob.metadata != null && batchJob.metadata.fileId != null){
        //find the file and stream it in
        var fileReadStream =  fileService.getFileReadStream(batchJob.metadata.fileId);
        var recordCount = 0;
        fileReadStream.on('error', function(fileReadError){
            logger.log("error","error streaming from gridfs", fileReadError);
            deferred.reject(fileReadError);
        });

        var parser = csv.parse();

        parser.on('data', function(record){
            parser.pause();
            recordCount += 1;
            var index = recordCount;
            var recordStart = new Date();
            return rowProcessor(record).then(function(resultInfo) {
                var resultType = batchService.getBatchResultFromBoolean(resultInfo.isSuccessful);
                var batchResult = new BatchResult({
                    batchRef: batchJob._id,
                    recordNumber: index,
                    status: resultType,
                    startDate: recordStart,
                    endDate: new Date(),
                    raw: record,
                    stepResults: resultInfo.stepResults
                });
                return mongoService.savePromise(batchResult).then(function(){
                    parser.resume();
                });
            });
        });

        parser.on('finish', function(){
            deferred.resolve({results: true});
        });

        parser.on('error', function(parserError){
            logger.log("error","error parsing csv", parserError);
            deferred.reject(parserError);
        });

        fileReadStream.pipe(parser);
    } else {
        deferred.reject({error: "batch job does not contain enough data to process"});
    }
    return deferred.promise;
};

fileService.createPostUploadHandler('batch', batchService.createBatchHandler);