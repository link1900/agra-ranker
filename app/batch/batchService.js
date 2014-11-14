var batchService = module.exports = {};

var _ = require('lodash');
var uuid = require('node-uuid');
var mongoose = require('mongoose');
var BatchJob = require('./batchJob').model;
var BatchResult = require('./batchResult').model;
var helper = require('../helper');
var mongoHelper = require('../mongoHelper');
var fileService = require('../file/fileService');
var q = require('q');

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
        console.log("["+process.name+"]" + " has been started");
        setInterval(batchService.processorTick, 5000, process);
    });

    console.log("[failed batch job checker]" + " has been started");
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
        //make debug console.log("[failed batch job checker] started looking for stuck batch jobs");
        mongoHelper.find(BatchJob, {status: batchService.batchStatuses.inProgress}).then(function(batchesInProgress){
            var proms = batchesInProgress.map(function(batchInProgress){
                if(!batchService.doesAnyProcessContainBatch(batchInProgress)){
                    //batch in progress that is not in a processor. mark it as failed
                    batchInProgress.status = batchService.batchStatuses.failed;
                    return mongoHelper.savePromise(batchInProgress).then(function(result){
                        console.log("[failed batch job checker] has marked batch job " +
                            " id: " + batchInProgress._id +
                            " name: " + batchInProgress.name +
                            " as Failed because nothing is processing it");
                        return result;
                    }, function(updateFailure){
                        batchService.failedCheckerState = batchService.states.standby;
                        console.log("[failed batch job checker] had an error trying to update a batch job to failed", updateFailure);
                    });
                } else {
                    return q(true);
                }
            });
            q.all(proms).then(function(){
                batchService.failedCheckerState = batchService.states.standby;
                //make debug console.log("[failed batch job checker] finished looking for stuck batch jobs");
            }, function(someError){
                console.log("[failed batch job checker] has had an error", someError);
                batchService.failedCheckerState = batchService.states.standby;
            });
        }, function(err){
            console.log("[failed batch job checker] has had an error", err);
            batchService.failedCheckerState = batchService.states.standby;
        });
    } else {
        console.log("[failed batch job checker] is busy did not fire at this time");
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
        console.log(processor.name + " is busy");
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
            console.log(processor.name + " had an error reading batch", err);
            batchService.clearProcessor(processor);
        } else if (batchToProcess != null) {
            console.log(processor.name + " started processing batch job " + batchToProcess.name);
            processor.state = batchService.states.processing;
            processor.processingBatch = batchToProcess;
            batchService.processBatch(processor.processingBatch).then(function(){
                console.log(processor.name + " finished processing batch job " + batchToProcess.name);
                batchToProcess.status = batchService.batchStatuses.completed;
                mongoHelper.savePromise(batchToProcess).then(function(){
                    batchService.clearProcessor(processor);
                }, function(){
                    console.log(processor.name + " had an error updating batch", err);
                    batchService.clearProcessor(processor);
                });
            }, function(batchProcessError){
                console.log(processor.name + " had an error processing batch job ", batchProcessError);
                batchToProcess.status = batchService.batchStatuses.failed;
                mongoHelper.savePromise(batchToProcess).then(function(){
                    batchService.clearProcessor(processor);
                }, function(){
                    console.log(processor.name + " had an error updating batch", err);
                    batchService.clearProcessor(processor);
                });
            });
        } else {
            //make debug console.log(processor.name + " found no batch jobs to process");
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

batchService.createBatch = function(name, type, metadata) {
    //generate the batch model
    var batch = new BatchJob({
        name:name,
        type:type,
        metadata: metadata,
        status: batchService.batchStatuses.awaitingProcessing
    });
    //then check the fields
    var error = batchService.hasError(batch);
    if (error){
        return q.reject(error);
    } else {
        return mongoHelper.savePromise(batch);
    }
};

batchService.hasError = function(batch){
    var error;
    var nameValid = batch.name && batch.name.length > 0;
    var typeValid = batch.type && batch.type.length > 0;
    if (!nameValid){
        if (!error){
            error = {errors:[]};
        }
        error.message = 'invalid field';
        error.errors.push('name is required');
    }

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
    return batchService.createBatch(req.headers.uploadfilename, req.param('batchType'), {fileId : file._id}).then(function(batch){
        return q(batch);
    }, function(batchCreationError){
        console.log("batch creation error");
        return q.reject({'error':batchCreationError});
    });
};

fileService.createPostUploadHandler('batch', batchService.createBatchHandler);